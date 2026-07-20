/**
 * Analytics Summary Stat Cards
 * 
 * Displays top-level metrics such as total event counts for the last 
 * 14 and 30 days, along with the current data source status.
 */
import { Activity, Calendar, Database } from "lucide-react";
import type { AnalyticsSummary } from "./types";

interface SummaryCardsProps {
  summary: AnalyticsSummary;
  total14d: number;
  total30d: number;
}

export const SummaryCards = ({ summary, total14d, total30d }: SummaryCardsProps) => {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <article className="ds-panel p-5 relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 opacity-10 transition-transform group-hover:scale-110">
          <Activity size={100} />
        </div>
        <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(225_16%_68%)] flex items-center gap-2">
          <Activity className="h-4 w-4" /> Last 14 days
        </h2>
        <p className="mt-3 tabular-nums text-4xl font-semibold leading-9 text-white">
          {total14d.toLocaleString()}
        </p>
        <p className="mt-2 text-xs text-[hsl(225_16%_68%)]">Event counts (UTC)</p>
      </article>
      <article className="ds-panel p-5 relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 opacity-10 transition-transform group-hover:scale-110">
          <Calendar size={100} />
        </div>
        <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(225_16%_68%)] flex items-center gap-2">
          <Calendar className="h-4 w-4" /> Last 30 days
        </h2>
        <p className="mt-3 tabular-nums text-4xl font-semibold leading-9 text-white">
          {total30d.toLocaleString()}
        </p>
        <p className="mt-2 text-xs text-[hsl(225_16%_68%)]">Event counts (UTC)</p>
      </article>
      <article className="ds-panel p-5 relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 opacity-10 transition-transform group-hover:scale-110">
          <Database size={100} />
        </div>
        <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(225_16%_68%)] flex items-center gap-2">
          <Database className="h-4 w-4" /> Storage
        </h2>
        <p className="mt-3 text-2xl font-semibold leading-9 text-white">
          {summary.storage === "neon" ? "Neon" : "Local file"}
        </p>
        <p className="mt-2 text-xs text-[hsl(225_16%_68%)]">Source for aggregates</p>
      </article>
    </section>
  );
};
