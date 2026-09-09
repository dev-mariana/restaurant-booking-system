import { describe, expect, it } from "vitest";
import { createId } from "../../../common/helpers/generate-id.js";
import { Reservation, ReservationStatus } from "../../../domain/reservation/reservation.entity.js";
import type { IReservationRepository } from "../../../domain/reservation/reservation.repository.js";
import { ListReservationsByEmailService } from "./list-reservations-by-email.service.js";

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

  async findById(): Promise<Reservation | null> {
    return null;
  }

  async findByCustomerEmail(email: string): Promise<Reservation[]> {
    return this.reservations.filter((reservation) => reservation.customerEmail === email);
  }

  async findConfirmedByTableAndDate(): Promise<Reservation[]> {
    return [];
  }

  async updateStatus(): Promise<Reservation> {
    throw new Error("not implemented");
  }
}

describe("ListReservationsByEmailService", () => {
  it("returns the reservations belonging to the given email", async () => {
    const mine = makeReservation({ customerEmail: "mari@example.com" });
    const someoneElses = makeReservation({ customerEmail: "other@example.com" });
    const repository = new FakeReservationRepository([mine, someoneElses]);
    const service = new ListReservationsByEmailService(repository);

    const result = await service.execute("mari@example.com");

    expect(result).toEqual([mine]);
  });

  it("returns an empty array when there are no reservations for the email", async () => {
    const repository = new FakeReservationRepository([]);
    const service = new ListReservationsByEmailService(repository);

    const result = await service.execute("nobody@example.com");

    expect(result).toEqual([]);
  });
});
