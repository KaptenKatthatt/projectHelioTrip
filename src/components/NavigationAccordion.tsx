import { useMemo, useState } from 'react';
import { CONSTELLATION_MENU_ITEMS } from '../lib/constellations';
import { useStore, type UniversePreset } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';
import { PlanetSelector } from './PlanetSelector';

type SectionId = 'planets' | 'starWars' | 'constellations' | 'universes';

type UniverseOption = {
  readonly id: UniversePreset;
  readonly label: string;
};

export const NavigationAccordion = () => {
  const { locale, t } = useTranslation();
  const [openSection, setOpenSection] = useState<SectionId | null>('planets');

  const selectedConstellation = useStore((s) => s.selectedConstellation);
  const constellationLinesVisible = useStore((s) => s.constellationLinesVisible);
  const selectedUniversePreset = useStore((s) => s.selectedUniversePreset);
  const focusSkyTarget = useStore((s) => s.focusSkyTarget);
  const toggleConstellationLinesVisible = useStore(
    (s) => s.toggleConstellationLinesVisible,
  );
  const setSelectedUniversePreset = useStore((s) => s.setSelectedUniversePreset);

  const constellationItems = useMemo(
    () =>
      CONSTELLATION_MENU_ITEMS.map((item) => ({
        id: item.id,
        label: locale === 'sv' ? item.labelSv : item.labelEn,
      })),
    [locale],
  );

  const universeOptions = useMemo<readonly UniverseOption[]>(
    () => [
      { id: 'solarSystem', label: t.ui.universeSolarSystem },
      { id: 'milkyWayOverview', label: t.ui.universeMilkyWayOverview },
    ],
    [t],
  );

  const toggleSection = (section: SectionId): void => {
    setOpenSection((current) => (current === section ? null : section));
  };

  const openPlanetsSection = (): void => {
    setSelectedUniversePreset('solarSystem');
    toggleSection('planets');
  };

  const openStarWarsSection = (): void => {
    setSelectedUniversePreset('starWars');
    toggleSection('starWars');
  };

  return (
    <nav className="pointer-events-auto flex max-h-[calc(100vh-2rem)] w-56 flex-col gap-1 overflow-y-auto rounded-2xl border border-white/10 bg-black/40 p-2 backdrop-blur-md">
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
              <div
                key={item.id}
                className={
                  'flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition ' +
                  (isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white')
                }
              >
                <button
                  type="button"
                  onClick={() => focusSkyTarget(item.id)}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className="truncate">{item.label}</span>
                </button>
                {isActive ? (
                  <span className="flex items-center">
                    <button
                      type="button"
                      onClick={toggleConstellationLinesVisible}
                      aria-label={
                        constellationLinesVisible
                          ? t.ui.hideConstellationLines
                          : t.ui.showConstellationLines
                      }
                      title={
                        constellationLinesVisible
                          ? t.ui.hideConstellationLines
                          : t.ui.showConstellationLines
                      }
                      className={
                        'rounded-md border px-1.5 py-0.5 text-[10px] leading-none transition ' +
                        (constellationLinesVisible
                          ? 'border-cyan-200/60 bg-cyan-300/20 text-cyan-100'
                          : 'border-white/25 bg-transparent text-white/55 hover:text-white/80')
                      }
                    >
                      ╱╲
                    </button>
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => openStarWarsSection()}
        className={
          'rounded-lg px-2.5 py-2 text-left text-[10px] font-medium uppercase tracking-[0.2em] transition ' +
          (openSection === 'starWars'
            ? 'bg-white/12 text-white/85'
            : 'text-white/45 hover:bg-white/8 hover:text-white/70')
        }
      >
        {t.ui.universeStarWars}
      </button>
      {openSection === 'starWars' ? (
        <PlanetSelector className="flex w-full flex-col gap-0.5" showHeading={false} />
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
          {selectedUniversePreset === 'milkyWayOverview' ? (
            <p className="px-2.5 pt-1 text-xs text-white/45">{t.ui.comingSoon}</p>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => openPlanetsSection()}
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
    </nav>
  );
};

