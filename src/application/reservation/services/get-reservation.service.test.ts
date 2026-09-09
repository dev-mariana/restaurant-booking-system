import { describe, expect, it } from "vitest";
import { NotFoundError } from "../../../common/errors/not-found-error.js";
import { createId } from "../../../common/helpers/generate-id.js";
import { Reservation, ReservationStatus } from "../../../domain/reservation/reservation.entity.js";
import type { IReservationRepository } from "../../../domain/reservation/reservation.repository.js";
import { GetReservationService } from "./get-reservation.service.js";

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

  async updateStatus(): Promise<Reservation> {
    throw new Error("not implemented");
  }
}

describe("GetReservationService", () => {
  it("throws NotFoundError when the reservation does not exist", async () => {
    const service = new GetReservationService(new FakeReservationRepository([]));

    await expect(service.execute(createId())).rejects.toBeInstanceOf(NotFoundError);
  });

  it("returns the reservation when it exists", async () => {
    const reservation = makeReservation();
    const service = new GetReservationService(new FakeReservationRepository([reservation]));

    const result = await service.execute(reservation.id);

    expect(result).toEqual(reservation);
  });
});
