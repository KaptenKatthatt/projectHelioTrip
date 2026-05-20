import { useEffect, useState } from "react";
import { useIsMobileLayout } from "../../hooks/useIsMobileLayout";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { useTranslation } from "../../hooks/useTranslation";
import { matchesMobileLayout } from "../../lib/mobileLayoutMedia";
import { useStore } from "../../store/useStore";
import { HudPanelToggleButton } from "../atoms/HudPanelToggleButton";
import { ConstellationList } from "./ConstellationList";
import { PlanetSelector } from "./PlanetSelector";
import { CameraTool } from "../molecules/CameraTool";
import { Compass, X } from "lucide-react";

type SectionId = "planets" | "constellations";

type NavigationAccordionProps = {
  readonly defaultOpenTablet?: boolean;
};

export const NavigationAccordion = ({ defaultOpenTablet = true }: NavigationAccordionProps) => {
  const { t } = useTranslation();
  const mobileLayout = useIsMobileLayout();
  const layoutTier = useResponsiveLayout();

  const [openSection, setOpenSection] = useState<SectionId | null>(() => {
    if (typeof window === "undefined") return null;
    return matchesMobileLayout() ? null : "planets";
  });

  const [prevDefaultOpenTablet, setPrevDefaultOpenTablet] = useState(defaultOpenTablet);
  const [isOpenTablet, setIsOpenTablet] = useState(defaultOpenTablet);

  // Reset isOpenTablet when the prop changes (e.g. viewport resize crossing the tablet breakpoint).
  // Performed in the render phase rather than useEffect as recommended by the React docs for
  // prop-derived state resets; a useEffect would cause a double-render flagged by the linter.
  if (defaultOpenTablet !== prevDefaultOpenTablet) {
    setPrevDefaultOpenTablet(defaultOpenTablet);
    setIsOpenTablet(defaultOpenTablet);
  }

  useEffect(() => {
    let prevBody = useStore.getState().activeBody;
    return useStore.subscribe((state) => {
      const nextBody = state.activeBody;
      if (nextBody === prevBody) return;
      prevBody = nextBody;
      if (matchesMobileLayout()) {
        setOpenSection(null);
      } else if (window.innerWidth < 1280) {
        // Collapse the tablet drawer when a new body is selected to focus on the 3D scene
        setIsOpenTablet(false);
      }
    });
  }, []);

  const toggleSection = (section: SectionId): void => {
    setOpenSection((current) => (current === section ? null : section));
  };

  const showCloseButton = layoutTier === "medium";

  // Collapsed floating state for tablet (medium) viewports
  if (layoutTier === "medium" && !isOpenTablet) {
    return (
      <div className="flex flex-row items-end gap-3 pointer-events-auto">
        <button
          type="button"
          onClick={() => setIsOpenTablet(true)}
          aria-label={t.learn.ui.railToggleOpen}
          className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-space-dark-900/95 px-4 py-3 shadow-xl backdrop-blur-md transition hover:bg-space-dark-800 text-white font-medium text-xs uppercase tracking-[0.2em]"
        >
          <Compass className="h-4 w-4 text-nebula-primary-300 animate-pulse" aria-hidden />
          <span>{t.ui.planets} / {t.ui.constellations}</span>
        </button>
        <CameraTool className="mb-2" />
      </div>
    );
  }

  return (
    <div className="flex flex-row items-end gap-3">
      <nav
        className={
          "pointer-events-auto relative flex max-h-full min-h-0 w-full flex-col gap-1 self-end overflow-hidden rounded-2xl border border-white/10 bg-space-dark-900/95 p-2 backdrop-blur-md " +
          (mobileLayout ? "" : "sm:w-56")
        }
      >
        {showCloseButton && (
          <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-white/5 mb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
              {t.ui.planets} / {t.ui.constellations}
            </span>
            <button
              type="button"
              onClick={() => setIsOpenTablet(false)}
              className="rounded-lg p-1 text-white/50 hover:bg-white/10 hover:text-white transition"
              aria-label={t.learn.ui.railToggleClose}
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => toggleSection("planets")}
          aria-expanded={openSection === "planets"}
          aria-label={`${openSection === "planets" ? t.ui.minimizePanel : t.ui.expandPanel}: ${t.ui.planets}`}
          className={
            "flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left text-xs font-medium uppercase tracking-[0.2em] transition " +
            (openSection === "planets"
              ? "bg-white/12 text-white/85"
              : "text-white/45 hover:bg-white/8 hover:text-white/70")
          }
        >
          <span>{t.ui.planets}</span>
          <HudPanelToggleButton asSpan expanded={openSection === "planets"} />
        </button>
        {openSection === "planets" ? (
          <div
            className={
              "min-h-0 overflow-y-auto pr-1 " +
              (mobileLayout
                ? "max-h-[min(26rem,55dvh)]"
                : "max-h-[min(32rem,62dvh)]")
            }
          >
            <PlanetSelector
              className="flex w-full flex-col gap-0.5"
              showHeading={false}
              onSelect={() => {
                if (!mobileLayout) return;
                setOpenSection(null);
              }}
            />
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => toggleSection("constellations")}
          aria-expanded={openSection === "constellations"}
          aria-label={`${openSection === "constellations" ? t.ui.minimizePanel : t.ui.expandPanel}: ${t.ui.constellations}`}
          className={
            "flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left text-xs font-medium uppercase tracking-[0.2em] transition " +
            (openSection === "constellations"
              ? "bg-white/12 text-white/85"
              : "text-white/45 hover:bg-white/8 hover:text-white/70")
          }
        >
          <span>{t.ui.constellations}</span>
          <HudPanelToggleButton
            asSpan
            expanded={openSection === "constellations"}
          />
        </button>
        {openSection === "constellations" ? (
          <ConstellationList
            onPick={() => {
              setOpenSection(null);
            }}
          />
        ) : null}
      </nav>

      {!mobileLayout && (
        <CameraTool className="mb-2" />
      )}
    </div>
  );
};
