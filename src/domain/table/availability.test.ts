import { describe, expect, it } from "vitest";
import { createId } from "../../common/helpers/generate-id.js";
import { Reservation, ReservationStatus } from "../reservation/reservation.entity.js";
import { computeAvailability } from "./availability.js";

function makeReservation(overrides: Partial<Reservation> = {}): Reservation {
  return Object.assign(new Reservation(), {
    id: createId(),
    tableId: createId(),
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

describe("computeAvailability", () => {
  it("marks every slot as available when there are no confirmed reservations", () => {
    const dayStart = new Date(2026, 7, 20);

    const slots = computeAvailability(dayStart, []);

    expect(slots).toHaveLength(12);
    expect(slots.every((slot) => slot.available)).toBe(true);
    expect(slots[0].start).toEqual(new Date(2026, 7, 20, 11, 0));
    expect(slots.at(-1)?.end).toEqual(new Date(2026, 7, 20, 23, 0));
  });

  it("marks the overlapping slot as unavailable", () => {
    const dayStart = new Date(2026, 7, 20);
    const reservation = makeReservation({
      slotStart: new Date(2026, 7, 20, 19, 0),
      slotEnd: new Date(2026, 7, 20, 20, 0),
    });

    const slots = computeAvailability(dayStart, [reservation]);

    const occupiedSlot = slots.find(
      (slot) => slot.start.getHours() === 19 && slot.end.getHours() === 20,
    );
    expect(occupiedSlot?.available).toBe(false);

    const otherSlots = slots.filter((slot) => slot !== occupiedSlot);
    expect(otherSlots.every((slot) => slot.available)).toBe(true);
  });

  it("does not mark adjacent slots as unavailable", () => {
    const dayStart = new Date(2026, 7, 20);
    const reservation = makeReservation({
      slotStart: new Date(2026, 7, 20, 19, 0),
      slotEnd: new Date(2026, 7, 20, 20, 0),
    });

    const slots = computeAvailability(dayStart, [reservation]);

    const before = slots.find((slot) => slot.end.getHours() === 19);
    const after = slots.find((slot) => slot.start.getHours() === 20);

    expect(before?.available).toBe(true);
    expect(after?.available).toBe(true);
  });

  it("ignores reservations that do not overlap any slot in the grid", () => {
    const dayStart = new Date(2026, 7, 20);
    const reservation = makeReservation({
      slotStart: new Date(2026, 7, 20, 8, 0),
      slotEnd: new Date(2026, 7, 20, 9, 0),
    });

    const slots = computeAvailability(dayStart, [reservation]);

    expect(slots.every((slot) => slot.available)).toBe(true);
  });
});
