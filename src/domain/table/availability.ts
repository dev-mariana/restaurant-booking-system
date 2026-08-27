import { timeSlotsOverlap } from "../../common/helpers/time-slot.js";
import type { Reservation } from "../reservation/reservation.entity.js";

const OPENING_HOUR = 11;
const CLOSING_HOUR = 23;
const SLOT_DURATION_MINUTES = 60;

export type AvailabilitySlot = {
  start: Date;
  end: Date;
  available: boolean;
};

export function buildAvailabilityCacheKey(tableId: string, date: Date): string {
  const dateKey = date.toISOString().slice(0, 10);

  return `availability:${tableId}:${dateKey}`;
}

export function computeAvailability(
  dayStart: Date,
  confirmedReservations: Reservation[],
): AvailabilitySlot[] {
  const openingTime = new Date(dayStart);
  openingTime.setHours(OPENING_HOUR, 0, 0, 0);

  const closingTime = new Date(dayStart);
  closingTime.setHours(CLOSING_HOUR, 0, 0, 0);

  const slotDurationMs = SLOT_DURATION_MINUTES * 60_000;
  const slotCount = (closingTime.getTime() - openingTime.getTime()) / slotDurationMs;

  return Array.from({ length: slotCount }, (_, index) => {
    const start = new Date(openingTime.getTime() + index * slotDurationMs);
    const end = new Date(start.getTime() + slotDurationMs);

    const available = !confirmedReservations.some((reservation) =>
      timeSlotsOverlap({ start, end }, { start: reservation.slotStart, end: reservation.slotEnd }),
    );

    return { start, end, available };
  });
}
