import { useCallback, useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { useStore } from '../store/useStore';
import {
  getLiveMoonOffset,
  getLivePosition,
  getLiveSatelliteOffset,
} from '../lib/positionsBus';
import { getBody } from '../lib/bodies';
import { MOON_AU_SCALE } from '../lib/moons';
import { AU_SCALE } from '../lib/constants';
import { getWikipediaUrl } from '../lib/wikipedia';
import { useTranslation } from '../hooks/useTranslation';

type Row = {
  label: string;
  value: string;
};

export const PlanetPanel = () => {
  const { t, planetName, bodyName, locale } = useTranslation();
  const activeBody = useStore((s) => s.activeBody);
  const viewMode = useStore((s) => s.viewMode);
  const isTraveling = useStore((s) => s.isTraveling);
  const simulationTime = useStore((s) => s.simulationTime);

  const [distanceFromSunAu, setDistanceFromSunAu] = useState(0);
  const [distanceFromParentAu, setDistanceFromParentAu] = useState(0);

  useEffect(() => {
    if (!activeBody) return;
    const body = getBody(activeBody);
    if (!body) return;

    let raf = 0;
    const tick = () => {
      if (body.kind === 'moon') {
        const offset = getLiveMoonOffset(body.def.id);
        const parent = getLivePosition(body.def.parent);
        setDistanceFromParentAu(offset.length() / MOON_AU_SCALE);
        setDistanceFromSunAu(
          Math.hypot(
            parent.x + offset.x,
            parent.y + offset.y,
            parent.z + offset.z,
          ) / AU_SCALE,
        );
      } else if (body.kind === 'satellite') {
        const offset = getLiveSatelliteOffset(body.def.id);
        const parent = getLivePosition(body.def.parent);
        setDistanceFromParentAu(offset.length() / MOON_AU_SCALE);
        setDistanceFromSunAu(
          Math.hypot(
            parent.x + offset.x,
            parent.y + offset.y,
            parent.z + offset.z,
          ) / AU_SCALE,
        );
      } else {
        const pos = getLivePosition(body.def.id);
        setDistanceFromSunAu(pos.length() / AU_SCALE);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [activeBody]);

  const openWikipedia = useCallback(() => {
    if (!activeBody) return;
    const url = getWikipediaUrl(activeBody, locale);
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [activeBody, locale]);

  if (!activeBody || viewMode === 'overview') return null;
  const body = getBody(activeBody);
  if (!body) return null;

  const dateFmt = new Intl.DateTimeFormat(locale === 'sv' ? 'sv-SE' : 'en-US', {
    dateStyle: 'long',
  });

  const rows: Row[] = [];
  if (body.kind === 'moon' || body.kind === 'satellite') {
    rows.push({ label: t.ui.parent, value: planetName(body.def.parent) });
    rows.push({
      label: t.ui.distanceFromParent,
      value: `${distanceFromParentAu.toFixed(5)} AU`,
    });
  }
  rows.push({
    label: t.ui.distance,
    value: `${distanceFromSunAu.toFixed(3)} AU`,
  });
  rows.push({
    label: t.ui.radius,
    value: `${body.def.radius.toFixed(2)} u`,
  });
  rows.push({
    label: t.ui.simDate,
    value: dateFmt.format(simulationTime),
  });

  const name = bodyName(activeBody);

  return (
    <aside className="pointer-events-auto w-80 rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <span
          className="h-3 w-3 rounded-full ring-1 ring-white/20"
          style={{ backgroundColor: body.def.color }}
        />
        <h2 className="text-lg font-semibold tracking-tight">{name}</h2>
      </div>
      {isTraveling && (
        <p className="mt-1 text-xs text-white/50">{t.ui.arriving}</p>
      )}
      <dl className="mt-4 space-y-2 text-sm">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between gap-4"
          >
            <dt className="text-white/55">{r.label}</dt>
            <dd className="font-mono text-white">{r.value}</dd>
          </div>
        ))}
      </dl>
      <button
        type="button"
        onClick={openWikipedia}
        aria-label={`${t.ui.readOnWikipedia}: ${name}`}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/90 transition hover:border-white/25 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      >
        <ExternalLink className="h-4 w-4" aria-hidden />
        {t.ui.readOnWikipedia}
      </button>
    </aside>
  );
};
