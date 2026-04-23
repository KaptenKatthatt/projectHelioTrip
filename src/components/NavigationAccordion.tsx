import { useMemo, useState } from 'react';
import { CONSTELLATION_MENU_ITEMS } from '../lib/constellations';
import { useStore, type UniversePreset } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';
import { PlanetSelector } from './PlanetSelector';

type SectionId = 'planets' | 'constellations' | 'universes';

type UniverseOption = {
  readonly id: UniversePreset;
  readonly label: string;
};

export const NavigationAccordion = () => {
  const { locale, t } = useTranslation();
  const [openSection, setOpenSection] = useState<SectionId>('planets');

  const selectedConstellation = useStore((s) => s.selectedConstellation);
  const selectedUniversePreset = useStore((s) => s.selectedUniversePreset);
  const setSelectedConstellation = useStore((s) => s.setSelectedConstellation);
  const setSelectedUniversePreset = useStore((s) => s.setSelectedUniversePreset);

  const constellationItems = useMemo(
    () =>
      CONSTELLATION_MENU_ITEMS.map((item) => ({
        id: item.id,
        kind: item.kind,
        label: locale === 'sv' ? item.labelSv : item.labelEn,
      })),
    [locale],
  );

  const universeOptions = useMemo<readonly UniverseOption[]>(
    () => [
      { id: 'solarSystem', label: t.ui.universeSolarSystem },
      { id: 'starWars', label: t.ui.universeStarWars },
      { id: 'milkyWayOverview', label: t.ui.universeMilkyWayOverview },
    ],
    [t],
  );

  const toggleSection = (section: SectionId): void => {
    setOpenSection((current) => (current === section ? section : section));
  };

  return (
    <nav className="pointer-events-auto flex w-56 flex-col gap-1 rounded-2xl border border-white/10 bg-black/40 p-2 backdrop-blur-md">
      <button
        type="button"
        onClick={() => toggleSection('planets')}
        className={
          'rounded-lg px-2.5 py-2 text-left text-[10px] font-medium uppercase tracking-[0.2em] transition ' +
          (openSection === 'planets'
            ? 'bg-white/12 text-white/85'
            : 'text-white/45 hover:bg-white/8 hover:text-white/70')
        }
      >
        {t.ui.planets}
      </button>
      {openSection === 'planets' ? (
        <PlanetSelector className="flex w-full flex-col gap-0.5" showHeading={false} />
      ) : null}

      <button
        type="button"
        onClick={() => toggleSection('constellations')}
        className={
          'rounded-lg px-2.5 py-2 text-left text-[10px] font-medium uppercase tracking-[0.2em] transition ' +
          (openSection === 'constellations'
            ? 'bg-white/12 text-white/85'
            : 'text-white/45 hover:bg-white/8 hover:text-white/70')
        }
      >
        {t.ui.constellations}
      </button>
      {openSection === 'constellations' ? (
        <div className="flex max-h-64 flex-col gap-0.5 overflow-y-auto pr-1">
          {constellationItems.map((item) => {
            const isActive = selectedConstellation === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedConstellation(item.id)}
                className={
                  'rounded-lg px-2.5 py-1.5 text-left text-sm transition ' +
                  (isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white')
                }
              >
                {item.label}
                {item.kind === 'star' ? (
                  <span className="ml-2 text-[10px] uppercase tracking-[0.14em] text-cyan-200/70">
                    {t.ui.focusStar}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => toggleSection('universes')}
        className={
          'rounded-lg px-2.5 py-2 text-left text-[10px] font-medium uppercase tracking-[0.2em] transition ' +
          (openSection === 'universes'
            ? 'bg-white/12 text-white/85'
            : 'text-white/45 hover:bg-white/8 hover:text-white/70')
        }
      >
        {t.ui.universes}
      </button>
      {openSection === 'universes' ? (
        <div className="flex flex-col gap-0.5">
          {universeOptions.map((option) => {
            const isActive = selectedUniversePreset === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedUniversePreset(option.id)}
                className={
                  'rounded-lg px-2.5 py-1.5 text-left text-sm transition ' +
                  (isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white')
                }
              >
                {option.label}
              </button>
            );
          })}
          <p className="px-2.5 pt-1 text-xs text-white/45">{t.ui.comingSoon}</p>
        </div>
      ) : null}
    </nav>
  );
};

