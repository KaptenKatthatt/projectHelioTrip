import { useEffect, useMemo, useState } from 'react';
import { CONSTELLATION_MENU_ITEMS } from '../lib/constellations';
import { useIsMobileLayout } from '../hooks/useIsMobileLayout';
import { useStore } from '../store/useStore';
import { matchesMobileLayout } from '../lib/mobileLayoutMedia';
import { useTranslation } from '../hooks/useTranslation';
import { PlanetSelector } from './PlanetSelector';

type SectionId = 'planets' | 'constellations';

export const NavigationAccordion = () => {
  const { locale, t } = useTranslation();
  const mobileLayout = useIsMobileLayout();
  const [openSection, setOpenSection] = useState<SectionId | null>(() => {
    if (typeof window === 'undefined') return null;
    return matchesMobileLayout() ? null : 'planets';
  });

  const selectedConstellation = useStore((s) => s.selectedConstellation);
  const constellationLinesVisible = useStore((s) => s.constellationLinesVisible);
  const focusSkyTarget = useStore((s) => s.focusSkyTarget);
  const toggleConstellationLinesVisible = useStore(
    (s) => s.toggleConstellationLinesVisible,
  );
  const constellationItems = useMemo(
    () =>
      CONSTELLATION_MENU_ITEMS.map((item) => ({
        id: item.id,
        label: locale === 'sv' ? item.labelSv : item.labelEn,
      })),
    [locale],
  );

  useEffect(() => {
    let prevBody = useStore.getState().activeBody;
    return useStore.subscribe((state) => {
      const nextBody = state.activeBody;
      if (nextBody === prevBody) return;
      prevBody = nextBody;
      if (!matchesMobileLayout()) return;
      setOpenSection(null);
    });
  }, []);

  const toggleSection = (section: SectionId): void => {
    setOpenSection((current) => (current === section ? null : section));
  };

  return (
    <nav
      className={
        'pointer-events-auto relative flex w-full flex-col gap-1 rounded-2xl border border-white/10 bg-black/40 p-2 backdrop-blur-md ' +
        (mobileLayout ? '' : 'sm:w-56')
      }
    >
      {openSection !== null ? (
        <button
          type="button"
          onClick={() => setOpenSection(null)}
          aria-label={t.ui.minimizePanel}
          className="absolute top-2 right-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-black/55 text-white/80 backdrop-blur-md transition hover:bg-white/15 hover:text-white"
        >
          <span className="text-lg leading-none">⌄</span>
        </button>
      ) : null}

      <button
        type="button"
        onClick={() => toggleSection('planets')}
        className={
          'rounded-lg px-2.5 py-2 pr-12 text-left text-[10px] font-medium uppercase tracking-[0.2em] transition ' +
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
          'rounded-lg px-2.5 py-2 pr-12 text-left text-[10px] font-medium uppercase tracking-[0.2em] transition ' +
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
                  onClick={() => {
                    focusSkyTarget(item.id);
                    setOpenSection(null);
                  }}
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
    </nav>
  );
};

