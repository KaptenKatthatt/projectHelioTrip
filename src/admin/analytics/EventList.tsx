/**
 * Detailed Event List with Breakdowns
 * 
 * Lists all tracked event names and their total counts. 
 * Allows expanding each event to view specific value distributions 
 * (e.g., seeing exactly which planets were selected).
 */
import { ChevronDown, ChevronRight } from "lucide-react";
import { EventSummary, formatBreakdownLabel } from "./types";

interface EventListProps {
  events: EventSummary[];
  expandedEvents: Set<string>;
  onToggleExpand: (name: string) => void;
  updatedAt?: string;
}

export const EventList = ({ events, expandedEvents, onToggleExpand, updatedAt }: EventListProps) => {
  return (
    <section className="ds-panel space-y-3 p-6 max-h-[400px] overflow-y-auto">
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-xl font-semibold leading-8 text-[hsl(223_25%_91%)]">
          All Events
        </h2>
        <span className="text-xs text-[hsl(225_16%_68%)]">
          Updated: {updatedAt ? new Date(updatedAt).toLocaleString() : "n/a"}
        </span>
      </div>
      {events.length === 0 ? (
        <p className="text-sm text-[hsl(225_16%_68%)]">No events yet.</p>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const expanded = expandedEvents.has(event.name);
            return (
              <article key={event.name} className="rounded-2xl border border-white/10 bg-white/5 transition-colors hover:bg-white/10">
                <button
                  type="button"
                  onClick={() => onToggleExpand(event.name)}
                  className="flex w-full items-center justify-between p-3 text-left"
                  aria-expanded={expanded}
                >
                  <span className="flex min-w-0 items-center gap-2 font-medium text-[hsl(223_25%_91%)]">
                    {expanded ? (
                      <ChevronDown className="h-4 w-4 shrink-0 text-[hsl(225_16%_68%)]" aria-hidden />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-[hsl(225_16%_68%)]" aria-hidden />
                    )}
                    <span className="truncate">{event.name}</span>
                  </span>
                  <span className="shrink-0 tabular-nums text-sm font-semibold text-[hsl(223_25%_91%)] bg-white/10 px-2 py-1 rounded-md">
                    {event.total.toLocaleString()}
                  </span>
                </button>
                {expanded && event.breakdown.length > 0 ? (
                  <ul className="space-y-1 border-t border-white/10 p-3 pt-2 text-sm text-[hsl(225_16%_68%)] bg-black/20 rounded-b-2xl">
                    {event.breakdown.map((item) => (
                      <li key={`${event.name}-${item.value}`} className="flex justify-between gap-4">
                        <span className="min-w-0 truncate">{formatBreakdownLabel(item.value)}</span>
                        <span className="shrink-0 tabular-nums text-[hsl(223_25%_91%)]">{item.count.toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
