import { beforeEach, describe, expect, it } from "vitest";
import { NotFoundError } from "../../../common/errors/not-found-error.js";
import { createId } from "../../../common/generate-id.js";
import type { ICacheRepository } from "../../../domain/cache/cache.repository.js";
import { Reservation, ReservationStatus } from "../../../domain/reservation/reservation.entity.js";
import type { IReservationRepository } from "../../../domain/reservation/reservation.repository.js";
import { buildAvailabilityCacheKey } from "../../../domain/table/availability.js";
import { ConfirmReservationService } from "./confirm-reservation.service.js";

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

  constructor(
    private readonly reservations: Reservation[],
    private readonly confirmedOnTable: Reservation[] = [],
  ) {}

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
    return this.confirmedOnTable;
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

describe("ConfirmReservationService", () => {
  let cacheRepository: FakeCacheRepository;

  beforeEach(() => {
    cacheRepository = new FakeCacheRepository();
  });

  it("throws NotFoundError when the reservation does not exist", async () => {
    const reservationRepository = new FakeReservationRepository([]);
    const service = new ConfirmReservationService(reservationRepository, cacheRepository);

    await expect(service.execute(createId())).rejects.toBeInstanceOf(NotFoundError);
  });

  it("confirms the reservation when there is no overlapping confirmed reservation", async () => {
    const pending = makeReservation();
    const reservationRepository = new FakeReservationRepository([pending], []);
    const service = new ConfirmReservationService(reservationRepository, cacheRepository);

    const result = await service.execute(pending.id);

    expect(result.status).toBe(ReservationStatus.Confirmed);
    expect(reservationRepository.updatedStatuses).toEqual([
      { id: pending.id, status: ReservationStatus.Confirmed },
    ]);
  });

  it("rejects the reservation when it overlaps an already confirmed reservation", async () => {
    const pending = makeReservation();
    const overlapping = makeReservation({
      id: createId(),
      tableId: pending.tableId,
      status: ReservationStatus.Confirmed,
    });
    const reservationRepository = new FakeReservationRepository([pending], [overlapping]);
    const service = new ConfirmReservationService(reservationRepository, cacheRepository);

    const result = await service.execute(pending.id);

    expect(result.status).toBe(ReservationStatus.Rejected);
    expect(reservationRepository.updatedStatuses).toEqual([
      { id: pending.id, status: ReservationStatus.Rejected },
    ]);
  });

  it("does not overlap when the confirmed reservation is at a different time", async () => {
    const pending = makeReservation();
    const nonOverlapping = makeReservation({
      id: createId(),
      tableId: pending.tableId,
      status: ReservationStatus.Confirmed,
      slotStart: new Date(2026, 7, 20, 20, 0),
      slotEnd: new Date(2026, 7, 20, 21, 0),
    });
    const reservationRepository = new FakeReservationRepository([pending], [nonOverlapping]);
    const service = new ConfirmReservationService(reservationRepository, cacheRepository);

    const result = await service.execute(pending.id);

    expect(result.status).toBe(ReservationStatus.Confirmed);
  });

  it("invalidates the availability cache for the reservation's table and date", async () => {
    const pending = makeReservation();
    const reservationRepository = new FakeReservationRepository([pending], []);
    const service = new ConfirmReservationService(reservationRepository, cacheRepository);

    await service.execute(pending.id);

    expect(cacheRepository.deletedKeys).toEqual([
      buildAvailabilityCacheKey(pending.tableId, pending.slotStart),
    ]);
  });

  it("returns the reservation as-is without re-evaluating when it is not pending", async () => {
    const confirmed = makeReservation({ status: ReservationStatus.Confirmed });
    const reservationRepository = new FakeReservationRepository([confirmed], []);
    const service = new ConfirmReservationService(reservationRepository, cacheRepository);

    const result = await service.execute(confirmed.id);

    expect(result.status).toBe(ReservationStatus.Confirmed);
    expect(reservationRepository.updatedStatuses).toHaveLength(0);
    expect(cacheRepository.deletedKeys).toHaveLength(0);
  });
});
