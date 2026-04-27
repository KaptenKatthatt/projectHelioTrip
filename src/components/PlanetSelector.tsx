import { useMemo } from "react";
import { useStore } from "../store/useStore";
import { PLANETS, type PlanetId } from "../lib/planets";
import { MOONS, type MoonDefinition } from "../lib/moons";
import { SATELLITES, type SatelliteDefinition } from "../lib/satellites";
import type { BodyId } from "../lib/bodies";
import { useTranslation } from "../hooks/useTranslation";

type PlanetSelectorProps = {
  readonly showHeading?: boolean;
  readonly className?: string;
  readonly onSelect?: (id: BodyId) => void;
  /** Larger planet color dots (mobile bottom sheet). */
  readonly largePlanetDots?: boolean;
};

type PlanetRow = {
  kind: "planet";
  id: PlanetId;
  color: string;
};

type ChildRow = {
  kind: "child";
  id: BodyId;
  color: string;
  isLast: boolean;
};

type Row = PlanetRow | ChildRow;

const buildRows = (): readonly Row[] => {
  const moonsByParent = new Map<PlanetId, MoonDefinition[]>();
  for (const m of MOONS) {
    const list = moonsByParent.get(m.parent) ?? [];
    list.push(m);
    moonsByParent.set(m.parent, list);
  }

  const satellitesByParent = new Map<PlanetId, SatelliteDefinition[]>();
  for (const s of SATELLITES) {
    const list = satellitesByParent.get(s.parent) ?? [];
    list.push(s);
    satellitesByParent.set(s.parent, list);
  }

  const rows: Row[] = [];
  for (const p of PLANETS) {
    rows.push({ kind: "planet", id: p.id, color: p.color });

    const satellites = satellitesByParent.get(p.id) ?? [];
    const moons = moonsByParent.get(p.id) ?? [];
    const total = satellites.length + moons.length;

    satellites.forEach((s, i) =>
      rows.push({
        kind: "child",
        id: s.id,
        color: s.color,
        isLast: i === total - 1,
      }),
    );
    moons.forEach((m, i) =>
      rows.push({
        kind: "child",
        id: m.id,
        color: m.color,
        isLast: satellites.length + i === total - 1,
      }),
    );
  }
  return rows;
};

export const PlanetSelector = ({
  showHeading = true,
  className,
  onSelect,
  largePlanetDots = false,
}: PlanetSelectorProps) => {
  const { t, bodyName } = useTranslation();
  const activeBody = useStore((s) => s.activeBody);
  const viewMode = useStore((s) => s.viewMode);
  const travelTo = useStore((s) => s.travelTo);

  const rows = useMemo(() => buildRows(), []);

  const handleSelect = (id: BodyId): void => {
    travelTo(id);
    onSelect?.(id);
  };

  return (
    <nav
      className={
        className ??
        "pointer-events-auto flex w-52 flex-col gap-0.5 rounded-2xl border border-white/10 bg-black/40 p-2 backdrop-blur-md"
      }
    >
      {showHeading ? (
        <h2 className="px-2 pb-1 pt-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
          {t.ui.planets}
        </h2>
      ) : null}
      {rows.map((row) => {
        const isActive = viewMode === "close" && activeBody === row.id;

        if (row.kind === "planet") {
          return (
            <button
              key={row.id}
              type="button"
              onClick={() => handleSelect(row.id)}
              className={
                "group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-sm transition " +
                (isActive
                  ? "bg-white/15 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white")
              }
            >
              <span
                className={
                  (largePlanetDots ? "h-3 w-3 " : "h-2.5 w-2.5 ") +
                  "shrink-0 rounded-full ring-1 ring-white/20"
                }
                style={{ backgroundColor: row.color }}
              />
              <span className="truncate">{bodyName(row.id)}</span>
            </button>
          );
        }

        return (
          <button
            key={row.id}
            type="button"
            onClick={() => handleSelect(row.id)}
            className={
              "group relative flex items-center gap-2 rounded-lg py-1 pr-2.5 pl-6 text-left text-xs transition " +
              (isActive
                ? "bg-white/15 text-white"
                : "text-white/55 hover:bg-white/10 hover:text-white/90")
            }
          >
            <span
              aria-hidden
              className={
                "pointer-events-none absolute left-3.5 top-0 w-px bg-white/15 " +
                (row.isLast ? "h-1/2" : "h-full")
              }
            />
            <span
              aria-hidden
              className="pointer-events-none absolute left-3.5 top-1/2 h-px w-2 -translate-y-1/2 bg-white/15"
            />
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full ring-1 ring-white/20"
              style={{ backgroundColor: row.color }}
            />
            <span className="truncate">{bodyName(row.id)}</span>
          </button>
        );
      })}
    </nav>
  );
};
