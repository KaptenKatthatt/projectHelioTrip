export type CommunityPulse = {
  readonly weekKey: string;
  readonly topBodySv: string;
  readonly topBodyEn: string;
  readonly completedChallenges: number;
};

const WEEKLY_PULSES: readonly CommunityPulse[] = [
  {
    weekKey: "2026-W18",
    topBodySv: "Europa",
    topBodyEn: "Europa",
    completedChallenges: 1842,
  },
];

const getIsoWeekKey = (date: Date): string => {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((utc.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${utc.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
};

export const getCommunityPulse = (date: Date): CommunityPulse | null => {
  const weekKey = getIsoWeekKey(date);
  return WEEKLY_PULSES.find((pulse) => pulse.weekKey === weekKey) ?? null;
};
