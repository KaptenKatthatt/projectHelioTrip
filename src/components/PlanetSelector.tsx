import { useStore } from '../store/useStore';
import { PLANETS } from '../lib/planets';
import { useTranslation } from '../hooks/useTranslation';

export const PlanetSelector = () => {
  const { t, planetName } = useTranslation();
  const activePlanet = useStore((s) => s.activePlanet);
  const viewMode = useStore((s) => s.viewMode);
  const travelTo = useStore((s) => s.travelTo);

  return (
    <nav className="pointer-events-auto flex w-48 flex-col gap-0.5 rounded-2xl border border-white/10 bg-black/40 p-2 backdrop-blur-md">
      <h2 className="px-2 pb-1 pt-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
        {t.ui.planets}
      </h2>
      {PLANETS.map((p) => {
        const isActive = viewMode === 'close' && activePlanet === p.id;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => travelTo(p.id)}
            className={
              'group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-sm transition ' +
              (isActive
                ? 'bg-white/15 text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white')
            }
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-white/20"
              style={{ backgroundColor: p.color }}
            />
            <span className="truncate">{planetName(p.id)}</span>
          </button>
        );
      })}
    </nav>
  );
};
