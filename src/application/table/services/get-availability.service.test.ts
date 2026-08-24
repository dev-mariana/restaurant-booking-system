import { beforeEach, describe, expect, it } from "vitest";
import { NotFoundError } from "../../../common/errors/not-found-error.js";
import { createId } from "../../../common/generate-id.js";
import type { ICacheRepository } from "../../../domain/cache/cache.repository.js";
import { Reservation, ReservationStatus } from "../../../domain/reservation/reservation.entity.js";
import type { IReservationRepository } from "../../../domain/reservation/reservation.repository.js";
import {
  type AvailabilitySlot,
  buildAvailabilityCacheKey,
} from "../../../domain/table/availability.js";
import { Table } from "../../../domain/table/table.entity.js";
import type { ITableRepository } from "../../../domain/table/table.repository.js";
import { GetAvailabilityService } from "./get-availability.service.js";

const defaultTableId = createId();

function makeTable(overrides: Partial<Table> = {}): Table {
  return Object.assign(new Table(), {
    id: defaultTableId,
    name: "Mesa 1",
    capacity: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });
}

function makeReservation(overrides: Partial<Reservation> = {}): Reservation {
  return Object.assign(new Reservation(), {
    id: createId(),
    tableId: defaultTableId,
    customerName: "Mari",
    customerEmail: "mari@example.com",
    slotStart: new Date(2026, 7, 20, 19, 0),
    slotEnd: new Date(2026, 7, 20, 20, 0),
    status: ReservationStatus.Confirmed,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });
}

class FakeTableRepository implements ITableRepository {
  constructor(private readonly tables: Table[]) {}

  async findAll(): Promise<Table[]> {
    return this.tables;
  }

  async findById(id: string): Promise<Table | null> {
    return this.tables.find((table) => table.id === id) ?? null;
  }
}

class FakeReservationRepository implements IReservationRepository {
  public findConfirmedByTableAndDateCalls = 0;

  constructor(private readonly reservations: Reservation[]) {}

  async create(reservation: Omit<Reservation, "createdAt" | "updatedAt">): Promise<Reservation> {
    const now = new Date();
    return Object.assign(new Reservation(), {
      ...reservation,
      createdAt: now,
      updatedAt: now,
    });
  }

  async findById(): Promise<Reservation | null> {
    return null;
  }

  async findByCustomerEmail(): Promise<Reservation[]> {
    return [];
  }

  async findConfirmedByTableAndDate(): Promise<Reservation[]> {
    this.findConfirmedByTableAndDateCalls++;

    return this.reservations;
  }

  async updateStatus(): Promise<Reservation> {
    throw new Error("not implemented");
  }
}

class FakeCacheRepository implements ICacheRepository {
  private readonly store = new Map<string, unknown>();

  async get<T>(key: string): Promise<T | null> {
    return (this.store.get(key) as T) ?? null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.store.set(key, value);
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }
}

describe("GetAvailabilityService", () => {
  let tableRepository: FakeTableRepository;
  let reservationRepository: FakeReservationRepository;
  let cacheRepository: FakeCacheRepository;
  let service: GetAvailabilityService;

  beforeEach(() => {
    tableRepository = new FakeTableRepository([makeTable()]);
    reservationRepository = new FakeReservationRepository([]);
    cacheRepository = new FakeCacheRepository();
    service = new GetAvailabilityService(tableRepository, reservationRepository, cacheRepository);
  });

  it("throws NotFoundError when the table does not exist", async () => {
    await expect(service.execute(createId(), new Date(2026, 7, 20))).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it("computes availability from confirmed reservations on a cache miss", async () => {
    reservationRepository = new FakeReservationRepository([
      makeReservation({
        slotStart: new Date(2026, 7, 20, 19, 0),
        slotEnd: new Date(2026, 7, 20, 20, 0),
      }),
    ]);
    service = new GetAvailabilityService(tableRepository, reservationRepository, cacheRepository);

    const slots = await service.execute(defaultTableId, new Date(2026, 7, 20));

    const occupiedSlot = slots.find((slot: AvailabilitySlot) => slot.start.getHours() === 19);
    expect(occupiedSlot?.available).toBe(false);
    expect(slots.filter((slot: AvailabilitySlot) => slot.available)).toHaveLength(slots.length - 1);
  });

  it("populates the cache after computing availability on a miss", async () => {
    const date = new Date(2026, 7, 20);
    await service.execute(defaultTableId, date);

    const cached = await cacheRepository.get<AvailabilitySlot[]>(
      buildAvailabilityCacheKey(defaultTableId, date),
    );
    expect(cached).not.toBeNull();
  });

  it("returns the cached value without hitting the reservation repository again", async () => {
    await service.execute(defaultTableId, new Date(2026, 7, 20));
    await service.execute(defaultTableId, new Date(2026, 7, 20));

    expect(reservationRepository.findConfirmedByTableAndDateCalls).toBe(1);
  });
});
