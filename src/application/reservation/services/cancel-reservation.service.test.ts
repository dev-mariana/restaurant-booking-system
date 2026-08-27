import { beforeEach, describe, expect, it } from "vitest";
import { ConflictError } from "../../../common/errors/conflict-error.js";
import { NotFoundError } from "../../../common/errors/not-found-error.js";
import { createId } from "../../../common/helpers/generate-id.js";
import type { ICacheRepository } from "../../../domain/cache/cache.repository.js";
import { Reservation, ReservationStatus } from "../../../domain/reservation/reservation.entity.js";
import type { IReservationRepository } from "../../../domain/reservation/reservation.repository.js";
import { buildAvailabilityCacheKey } from "../../../domain/table/availability.js";
import { CancelReservationService } from "./cancel-reservation.service.js";

function makeReservation(overrides: Partial<Reservation> = {}): Reservation {
  return Object.assign(new Reservation(), {
    id: createId(),
    tableId: createId(),
    customerName: "Mari",
    customerEmail: "mari@example.com",
    slotStart: new Date(2026, 7, 20, 19, 0),
    slotEnd: new Date(2026, 7, 20, 20, 0),
    status: ReservationStatus.Pending,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });
}

class FakeReservationRepository implements IReservationRepository {
  public updatedStatuses: { id: string; status: ReservationStatus }[] = [];

  constructor(private readonly reservations: Reservation[]) {}

  async create(): Promise<Reservation> {
    throw new Error("not implemented");
  }

  async findById(id: string): Promise<Reservation | null> {
    return this.reservations.find((reservation) => reservation.id === id) ?? null;
  }

  async findByCustomerEmail(): Promise<Reservation[]> {
    return [];
  }

  async findConfirmedByTableAndDate(): Promise<Reservation[]> {
    return [];
  }

  async updateStatus(id: string, status: ReservationStatus): Promise<Reservation> {
    this.updatedStatuses.push({ id, status });

    const reservation = this.reservations.find((r) => r.id === id);
    if (!reservation) {
      throw new Error("reservation not found");
    }

    return Object.assign(new Reservation(), { ...reservation, status });
  }
}

class FakeCacheRepository implements ICacheRepository {
  private readonly store = new Map<string, unknown>();
  public deletedKeys: string[] = [];

  async get<T>(key: string): Promise<T | null> {
    return (this.store.get(key) as T) ?? null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.store.set(key, value);
  }

  async del(key: string): Promise<void> {
    this.deletedKeys.push(key);
    this.store.delete(key);
  }
}

describe("CancelReservationService", () => {
  let cacheRepository: FakeCacheRepository;

  beforeEach(() => {
    cacheRepository = new FakeCacheRepository();
  });

  it("throws NotFoundError when the reservation does not exist", async () => {
    const reservationRepository = new FakeReservationRepository([]);
    const service = new CancelReservationService(reservationRepository, cacheRepository);

    await expect(service.execute(createId())).rejects.toBeInstanceOf(NotFoundError);
  });

  it("cancels a pending reservation", async () => {
    const pending = makeReservation({ status: ReservationStatus.Pending });
    const reservationRepository = new FakeReservationRepository([pending]);
    const service = new CancelReservationService(reservationRepository, cacheRepository);

    const result = await service.execute(pending.id);

    expect(result.status).toBe(ReservationStatus.Cancelled);
    expect(reservationRepository.updatedStatuses).toEqual([
      { id: pending.id, status: ReservationStatus.Cancelled },
    ]);
  });

  it("cancels a confirmed reservation", async () => {
    const confirmed = makeReservation({ status: ReservationStatus.Confirmed });
    const reservationRepository = new FakeReservationRepository([confirmed]);
    const service = new CancelReservationService(reservationRepository, cacheRepository);

    const result = await service.execute(confirmed.id);

    expect(result.status).toBe(ReservationStatus.Cancelled);
  });

  it("throws ConflictError when the reservation is already cancelled", async () => {
    const cancelled = makeReservation({ status: ReservationStatus.Cancelled });
    const reservationRepository = new FakeReservationRepository([cancelled]);
    const service = new CancelReservationService(reservationRepository, cacheRepository);

    await expect(service.execute(cancelled.id)).rejects.toBeInstanceOf(ConflictError);
    expect(reservationRepository.updatedStatuses).toHaveLength(0);
  });

  it("throws ConflictError when the reservation is already rejected", async () => {
    const rejected = makeReservation({ status: ReservationStatus.Rejected });
    const reservationRepository = new FakeReservationRepository([rejected]);
    const service = new CancelReservationService(reservationRepository, cacheRepository);

    await expect(service.execute(rejected.id)).rejects.toBeInstanceOf(ConflictError);
    expect(reservationRepository.updatedStatuses).toHaveLength(0);
  });

  it("invalidates the availability cache for the reservation's table and date", async () => {
    const pending = makeReservation();
    const reservationRepository = new FakeReservationRepository([pending]);
    const service = new CancelReservationService(reservationRepository, cacheRepository);

    await service.execute(pending.id);

    expect(cacheRepository.deletedKeys).toEqual([
      buildAvailabilityCacheKey(pending.tableId, pending.slotStart),
    ]);
  });

  it("does not touch the cache when cancellation is rejected", async () => {
    const cancelled = makeReservation({ status: ReservationStatus.Cancelled });
    const reservationRepository = new FakeReservationRepository([cancelled]);
    const service = new CancelReservationService(reservationRepository, cacheRepository);

    await expect(service.execute(cancelled.id)).rejects.toBeInstanceOf(ConflictError);
    expect(cacheRepository.deletedKeys).toHaveLength(0);
  });
});
