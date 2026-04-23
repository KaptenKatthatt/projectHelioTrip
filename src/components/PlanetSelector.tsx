import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { PLANETS, type PlanetId } from '../lib/planets';
import { MOONS, type MoonDefinition } from '../lib/moons';
import { SATELLITES, type SatelliteDefinition } from '../lib/satellites';
import { STAR_WARS_SYSTEMS, type StarWarsBodyId } from '../lib/starWarsSystems';
import type { BodyId } from '../lib/bodies';
import { useTranslation } from '../hooks/useTranslation';

type PlanetSelectorProps = {
  readonly showHeading?: boolean;
  readonly className?: string;
};

type PlanetRow = {
  kind: 'planet';
  id: PlanetId;
  color: string;
};

type ChildRow = {
  kind: 'child';
  id: BodyId | StarWarsBodyId;
  label?: string;
  source: 'solar' | 'starWars';
  color: string;
  isLast: boolean;
};

type SystemRow = {
  kind: 'system';
  id: string;
  label: string;
  color: string;
};

type Row = PlanetRow | ChildRow | SystemRow;

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
    rows.push({ kind: 'planet', id: p.id, color: p.color });

    const satellites = satellitesByParent.get(p.id) ?? [];
    const moons = moonsByParent.get(p.id) ?? [];
    const total = satellites.length + moons.length;

    satellites.forEach((s, i) =>
      rows.push({
        kind: 'child',
        id: s.id,
        source: 'solar',
        color: s.color,
        isLast: i === total - 1,
      }),
    );
    moons.forEach((m, i) =>
      rows.push({
        kind: 'child',
        id: m.id,
        source: 'solar',
        color: m.color,
        isLast: satellites.length + i === total - 1,
      }),
    );
  }
  return rows;
};

const buildStarWarsRows = (locale: 'sv' | 'en'): readonly Row[] => {
  const rows: Row[] = [];
  for (const system of STAR_WARS_SYSTEMS) {
    rows.push({
      kind: 'system',
      id: system.id,
      label: locale === 'sv' ? system.labelSv : system.labelEn,
      color: system.color,
    });

    const total = system.bodies.length;
    system.bodies.forEach((body, i) =>
      rows.push({
        kind: 'child',
        id: body.id,
        label: locale === 'sv' ? body.labelSv : body.labelEn,
        source: 'starWars',
        color: body.color,
        isLast: i === total - 1,
      }),
    );
  }
  return rows;
};

export const PlanetSelector = ({
  showHeading = true,
  className,
}: PlanetSelectorProps) => {
  const { t, bodyName } = useTranslation();
  const locale = useStore((s) => s.locale);
  const activeBody = useStore((s) => s.activeBody);
  const selectedStarWarsBody = useStore((s) => s.selectedStarWarsBody);
  const viewMode = useStore((s) => s.viewMode);
  const selectedUniversePreset = useStore((s) => s.selectedUniversePreset);
  const travelTo = useStore((s) => s.travelTo);
  const travelToStarWars = useStore((s) => s.travelToStarWars);

  const rows = useMemo(
    () =>
      selectedUniversePreset === 'starWars'
        ? buildStarWarsRows(locale)
        : buildRows(),
    [locale, selectedUniversePreset],
  );

  return (
    <nav
      className={
        className ??
        'pointer-events-auto flex w-52 flex-col gap-0.5 rounded-2xl border border-white/10 bg-black/40 p-2 backdrop-blur-md'
      }
    >
      {showHeading ? (
        <h2 className="px-2 pb-1 pt-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
          {t.ui.planets}
        </h2>
      ) : null}
      {rows.map((row) => {
        const isActive =
          row.kind === 'planet'
            ? viewMode === 'close' && activeBody === row.id
            : row.kind === 'child' && row.source === 'solar'
              ? viewMode === 'close' && activeBody === row.id
              : row.kind === 'child' && row.source === 'starWars'
                ? selectedStarWarsBody === row.id
              : false;

        if (row.kind === 'system') {
          return (
            <div
              key={row.id}
              className="group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-sm text-white/75"
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-white/20"
                style={{ backgroundColor: row.color }}
              />
              <span className="truncate">{row.label}</span>
            </div>
          );
        }

        if (row.kind === 'planet') {
          return (
            <button
              key={row.id}
              type="button"
              onClick={() => travelTo(row.id)}
              className={
                'group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-sm transition ' +
                (isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white')
              }
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-white/20"
                style={{ backgroundColor: row.color }}
              />
              <span className="truncate">{bodyName(row.id)}</span>
            </button>
          );
        }

        const childLabel =
          row.source === 'starWars'
            ? (row.label ?? '')
            : bodyName(row.id as BodyId);

        return (
          <button
            key={row.id}
            type="button"
            onClick={
              row.source === 'starWars'
                ? () => travelToStarWars(row.id as StarWarsBodyId)
                : () => travelTo(row.id as BodyId)
            }
            className={
              'group relative flex items-center gap-2 rounded-lg py-1 pr-2.5 pl-6 text-left text-xs transition ' +
              (isActive
                ? 'bg-white/15 text-white'
                : 'text-white/55 hover:bg-white/10 hover:text-white/90')
            }
          >
            <span
              aria-hidden
              className={
                'pointer-events-none absolute left-3.5 top-0 w-px bg-white/15 ' +
                (row.isLast ? 'h-1/2' : 'h-full')
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
            <span className="truncate">{childLabel}</span>
          </button>
        );
      })}
    </nav>
  );
};
