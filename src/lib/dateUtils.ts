export const dateKeyFromLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const todayDateKey = (): string => dateKeyFromLocalDate(new Date());

export const parseDateKeyToUtcMs = (dateKey: string): number | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return Date.UTC(year, month - 1, day);
};

export const daysBetweenDateKeys = (previousKey: string, nextKey: string): number => {
  const previousUtc = parseDateKeyToUtcMs(previousKey);
  const nextUtc = parseDateKeyToUtcMs(nextKey);
  if (previousUtc === null || nextUtc === null) return Number.POSITIVE_INFINITY;
  return Math.round((nextUtc - previousUtc) / 86_400_000);
};
