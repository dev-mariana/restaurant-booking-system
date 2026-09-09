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
    slotStart: new Date("2026-08-20T19:00:00.000Z"),
    slotEnd: new Date("2026-08-20T20:00:00.000Z"),
    status: ReservationStatus.Confirmed,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });
}

describe("computeAvailability", () => {
  it("marks every slot as available when there are no confirmed reservations", () => {
    const dayStart = new Date("2026-08-20T00:00:00.000Z");

    const slots = computeAvailability(dayStart, []);

    expect(slots).toHaveLength(12);
    expect(slots.every((slot) => slot.available)).toBe(true);
    expect(slots[0].start).toEqual(new Date("2026-08-20T11:00:00.000Z"));
    expect(slots.at(-1)?.end).toEqual(new Date("2026-08-20T23:00:00.000Z"));
  });

  it("marks the overlapping slot as unavailable", () => {
    const dayStart = new Date("2026-08-20T00:00:00.000Z");
    const reservation = makeReservation({
      slotStart: new Date("2026-08-20T19:00:00.000Z"),
      slotEnd: new Date("2026-08-20T20:00:00.000Z"),
    });

    const slots = computeAvailability(dayStart, [reservation]);

    const occupiedSlot = slots.find(
      (slot) => slot.start.getUTCHours() === 19 && slot.end.getUTCHours() === 20,
    );
    expect(occupiedSlot?.available).toBe(false);

    const otherSlots = slots.filter((slot) => slot !== occupiedSlot);
    expect(otherSlots.every((slot) => slot.available)).toBe(true);
  });

  it("does not mark adjacent slots as unavailable", () => {
    const dayStart = new Date("2026-08-20T00:00:00.000Z");
    const reservation = makeReservation({
      slotStart: new Date("2026-08-20T19:00:00.000Z"),
      slotEnd: new Date("2026-08-20T20:00:00.000Z"),
    });

    const slots = computeAvailability(dayStart, [reservation]);

    const before = slots.find((slot) => slot.end.getUTCHours() === 19);
    const after = slots.find((slot) => slot.start.getUTCHours() === 20);

    expect(before?.available).toBe(true);
    expect(after?.available).toBe(true);
  });

  it("ignores reservations that do not overlap any slot in the grid", () => {
    const dayStart = new Date("2026-08-20T00:00:00.000Z");
    const reservation = makeReservation({
      slotStart: new Date("2026-08-20T08:00:00.000Z"),
      slotEnd: new Date("2026-08-20T09:00:00.000Z"),
    });

    const slots = computeAvailability(dayStart, [reservation]);

    expect(slots.every((slot) => slot.available)).toBe(true);
  });
});
