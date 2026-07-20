/**
 * Analytics Data Types and Utilities
 * 
 * Defines the structure for event summaries and daily aggregates retrieved 
 * from the analytics API.
 */
export type EventBreakdown = {
  value: string;
  count: number;
};

export type EventSummary = {
  name: string;
  total: number;
  breakdown: EventBreakdown[];
};

export type DaySummary = {
  date: string;
  total: number;
};

export type AnalyticsSummary = {
  updatedAt: string;
  storage: "neon" | "local-file";
  byEvent: EventSummary[];
  byDay: DaySummary[];
};

export const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const formatBreakdownLabel = (value: string): string =>
  value === "none" ? "nbr_times_activated" : value;
