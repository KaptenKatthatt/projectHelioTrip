import { useEffect, useState } from "react";
import { useIsMobileLayout } from "../../hooks/useIsMobileLayout";
import { useTranslation } from "../../hooks/useTranslation";
import { matchesMobileLayout } from "../../lib/mobileLayoutMedia";
import { useStore } from "../../store/useStore";
import { HudPanelToggleButton } from "../atoms/HudPanelToggleButton";
import { ConstellationList } from "./ConstellationList";
import { PlanetSelector } from "./PlanetSelector";

type SectionId = "planets" | "constellations";

export const NavigationAccordion = () => {
  const { t } = useTranslation();
  const mobileLayout = useIsMobileLayout();
  const [openSection, setOpenSection] = useState<SectionId | null>(() => {
    if (typeof window === "undefined") return null;
    return matchesMobileLayout() ? null : "planets";
  });

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
        "pointer-events-auto relative flex max-h-full min-h-0 w-full flex-col gap-1 self-end overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-2 backdrop-blur-md " +
        (mobileLayout ? "" : "sm:w-56")
      }
    >
      <button
        type="button"
        onClick={() => toggleSection("planets")}
        aria-expanded={openSection === "planets"}
        aria-label={`${openSection === "planets" ? t.ui.minimizePanel : t.ui.expandPanel}: ${t.ui.planets}`}
        className={
          "flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left text-[10px] font-medium uppercase tracking-[0.2em] transition " +
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
          "flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left text-[10px] font-medium uppercase tracking-[0.2em] transition " +
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
  );
};
