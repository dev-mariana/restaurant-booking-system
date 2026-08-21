export type DayRange = {
  start: Date;
  end: Date;
};

export function getDayRange(date: Date): DayRange {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
}
