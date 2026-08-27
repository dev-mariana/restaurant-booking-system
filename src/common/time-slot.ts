import { BadRequestError } from "./errors/bad-request-error.js";

export type TimeSlot = {
  start: Date;
  end: Date;
};

export function createTimeSlot(start: Date, end: Date): TimeSlot {
  if (end <= start) {
    throw new BadRequestError("slot_end must be after slot_start");
  }

  return { start, end };
}

export function timeSlotsOverlap(a: TimeSlot, b: TimeSlot): boolean {
  return a.start < b.end && b.start < a.end;
}

export function timeSlotsEqual(a: TimeSlot, b: TimeSlot): boolean {
  return a.start.getTime() === b.start.getTime() && a.end.getTime() === b.end.getTime();
}
