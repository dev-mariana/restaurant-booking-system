import { beforeEach, describe, expect, it } from "vitest";
import { NotFoundError } from "../../../common/errors/not-found-error.js";
import type { IReservationQueue } from "../../../domain/queue/reservation-queue.js";
import { Reservation, ReservationStatus } from "../../../domain/reservation/reservation.entity.js";
import type { IReservationRepository } from "../../../domain/reservation/reservation.repository.js";
import { Table } from "../../../domain/table/table.entity.js";
import type { ITableRepository } from "../../../domain/table/table.repository.js";
import type { CreateReservationDTO } from "../schemas/create-reservation.schema.js";
import { CreateReservationService } from "./create-reservation.service.js";

function makeTable(overrides: Partial<Table> = {}): Table {
  return Object.assign(new Table(), {
    id: "table-1",
    name: "Mesa 1",
    capacity: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });
}

function makeDto(overrides: Partial<CreateReservationDTO> = {}): CreateReservationDTO {
  return {
    tableId: "table-1",
    customerName: "Mari",
    customerEmail: "mari@example.com",
    slotStart: new Date(2026, 7, 20, 19, 0),
    slotEnd: new Date(2026, 7, 20, 20, 0),
    ...overrides,
  };
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
  public created: Reservation[] = [];

  async create(reservation: Omit<Reservation, "createdAt" | "updatedAt">): Promise<Reservation> {
    const now = new Date();
    const persisted = Object.assign(new Reservation(), {
      ...reservation,
      createdAt: now,
      updatedAt: now,
    });
    this.created.push(persisted);

    return persisted;
  }

  async findById(): Promise<Reservation | null> {
    return null;
  }

  async findByCustomerEmail(): Promise<Reservation[]> {
    return [];
  }

  async findConfirmedByTableAndDate(): Promise<Reservation[]> {
    return [];
  }

  async cancelReservation(): Promise<void> {}
}

class FakeReservationQueue implements IReservationQueue {
  public enqueued: { reservationId: string; tableId: string }[] = [];

  async enqueueConfirmation(reservationId: string, tableId: string): Promise<void> {
    this.enqueued.push({ reservationId, tableId });
  }
}

describe("CreateReservationService", () => {
  let tableRepository: FakeTableRepository;
  let reservationRepository: FakeReservationRepository;
  let reservationQueue: FakeReservationQueue;
  let service: CreateReservationService;

  beforeEach(() => {
    tableRepository = new FakeTableRepository([makeTable()]);
    reservationRepository = new FakeReservationRepository();
    reservationQueue = new FakeReservationQueue();
    service = new CreateReservationService(
      tableRepository,
      reservationRepository,
      reservationQueue,
    );
  });

  it("throws NotFoundError when the table does not exist", async () => {
    await expect(service.execute(makeDto({ tableId: "missing-table" }))).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it("throws when slot_end is not after slot_start", async () => {
    await expect(
      service.execute(
        makeDto({
          slotStart: new Date(2026, 7, 20, 20, 0),
          slotEnd: new Date(2026, 7, 20, 19, 0),
        }),
      ),
    ).rejects.toThrow();
  });

  it("creates the reservation with pending status", async () => {
    const reservation = await service.execute(makeDto());

    expect(reservation.status).toBe(ReservationStatus.Pending);
    expect(reservationRepository.created).toHaveLength(1);
    expect(reservationRepository.created[0]?.status).toBe(ReservationStatus.Pending);
  });

  it("enqueues a confirmation job for the created reservation", async () => {
    const reservation = await service.execute(makeDto());

    expect(reservationQueue.enqueued).toEqual([
      { reservationId: reservation.id, tableId: reservation.tableId },
    ]);
  });
});
