import { describe, expect, it } from "vitest";
import { createTimeSlot, timeSlotsEqual, timeSlotsOverlap } from "./time-slot.js";

describe("createTimeSlot", () => {
  it("creates a valid time slot when end is after start", () => {
    const start = new Date("2026-08-20T19:00:00Z");
    const end = new Date("2026-08-20T20:00:00Z");

    const slot = createTimeSlot(start, end);

    expect(slot.start).toBe(start);
    expect(slot.end).toBe(end);
  });

  it("throws when end equals start", () => {
    const time = new Date("2026-08-20T19:00:00Z");

    expect(() => createTimeSlot(time, time)).toThrow("slot_end must be after slot_start");
  });

  it("throws when end is before start", () => {
    const start = new Date("2026-08-20T20:00:00Z");
    const end = new Date("2026-08-20T19:00:00Z");

    expect(() => createTimeSlot(start, end)).toThrow("slot_end must be after slot_start");
  });
});

describe("timeSlotsOverlap", () => {
  it("detects overlapping slots", () => {
    const a = createTimeSlot(new Date("2026-08-20T19:00:00Z"), new Date("2026-08-20T20:00:00Z"));
    const b = createTimeSlot(new Date("2026-08-20T19:30:00Z"), new Date("2026-08-20T20:30:00Z"));

    expect(timeSlotsOverlap(a, b)).toBe(true);
    expect(timeSlotsOverlap(b, a)).toBe(true);
  });

  it("does not consider adjacent slots as overlapping", () => {
    const a = createTimeSlot(new Date("2026-08-20T19:00:00Z"), new Date("2026-08-20T20:00:00Z"));
    const b = createTimeSlot(new Date("2026-08-20T20:00:00Z"), new Date("2026-08-20T21:00:00Z"));

    expect(timeSlotsOverlap(a, b)).toBe(false);
  });

  it("does not consider disjoint slots as overlapping", () => {
    const a = createTimeSlot(new Date("2026-08-20T19:00:00Z"), new Date("2026-08-20T20:00:00Z"));
    const b = createTimeSlot(new Date("2026-08-20T21:00:00Z"), new Date("2026-08-20T22:00:00Z"));

    expect(timeSlotsOverlap(a, b)).toBe(false);
  });
});

describe("timeSlotsEqual", () => {
  it("considers equal slots equal", () => {
    const start = new Date("2026-08-20T19:00:00Z");
    const end = new Date("2026-08-20T20:00:00Z");

    const a = createTimeSlot(start, end);
    const b = createTimeSlot(new Date(start), new Date(end));

    expect(timeSlotsEqual(a, b)).toBe(true);
  });
});
