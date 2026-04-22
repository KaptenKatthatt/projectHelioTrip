import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { getPlanet } from '../lib/planets';
import { getLivePosition } from '../lib/positionsBus';
import { AU_SCALE } from '../lib/constants';
import { useTranslation } from '../hooks/useTranslation';

type Row = {
  label: string;
  value: string;
};

export const PlanetPanel = () => {
  const { t, planetName, locale } = useTranslation();
  const activePlanet = useStore((s) => s.activePlanet);
  const viewMode = useStore((s) => s.viewMode);
  const isTraveling = useStore((s) => s.isTraveling);
  const simulationTime = useStore((s) => s.simulationTime);

  const [distanceAu, setDistanceAu] = useState(0);

  useEffect(() => {
    if (!activePlanet) return;
    let raf = 0;
    const tick = () => {
      const pos = getLivePosition(activePlanet);
      setDistanceAu(pos.length() / AU_SCALE);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [activePlanet]);

  if (!activePlanet || viewMode === 'overview') return null;
  const planet = getPlanet(activePlanet);
  if (!planet) return null;

  const dateFmt = new Intl.DateTimeFormat(locale === 'sv' ? 'sv-SE' : 'en-US', {
    dateStyle: 'long',
  });

  const rows: readonly Row[] = [
    { label: t.ui.distance, value: `${distanceAu.toFixed(3)} AU` },
    { label: t.ui.radius, value: `${planet.radius.toFixed(2)} u` },
    { label: t.ui.simDate, value: dateFmt.format(simulationTime) },
  ];

  return (
    <aside className="pointer-events-auto w-80 rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <span
          className="h-3 w-3 rounded-full ring-1 ring-white/20"
          style={{ backgroundColor: planet.color }}
        />
        <h2 className="text-lg font-semibold tracking-tight">
          {planetName(activePlanet)}
        </h2>
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
    </aside>
  );
};
