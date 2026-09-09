import { describe, expect, it } from "vitest";
import { getDayRange } from "./day-range.js";

describe("getDayRange", () => {
  it("returns UTC day boundaries for a UTC-midnight date", () => {
    const { start, end } = getDayRange(new Date("2026-09-22T00:00:00.000Z"));

    expect(start).toEqual(new Date("2026-09-22T00:00:00.000Z"));
    expect(end).toEqual(new Date("2026-09-23T00:00:00.000Z"));
  });

  it("keeps the same UTC calendar day regardless of the host's local timezone", () => {
    // Regression test: setHours()/setDate() operate in the host's local timezone,
    // which shifted the day back whenever that timezone has a negative UTC offset
    // (e.g. America/Sao_Paulo, UTC-3) applied to a Zod-coerced UTC-midnight date.
    const { start, end } = getDayRange(new Date("2026-09-22T00:00:00.000Z"));

    expect(start.getUTCFullYear()).toBe(2026);
    expect(start.getUTCMonth()).toBe(8);
    expect(start.getUTCDate()).toBe(22);
    expect(end.getUTCDate()).toBe(23);
  });

  it("normalizes a date with a non-zero time-of-day to that same UTC day's start", () => {
    const { start, end } = getDayRange(new Date("2026-09-22T15:30:00.000Z"));

    expect(start).toEqual(new Date("2026-09-22T00:00:00.000Z"));
    expect(end).toEqual(new Date("2026-09-23T00:00:00.000Z"));
  });
});
