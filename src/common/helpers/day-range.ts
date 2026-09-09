export type DayRange = {
  start: Date;
  end: Date;
};

export function getDayRange(date: Date): DayRange {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return { start, end };
}
