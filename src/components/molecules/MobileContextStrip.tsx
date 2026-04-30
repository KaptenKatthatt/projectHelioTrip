import { ChevronLeft } from "lucide-react";
import { CONSTELLATION_MENU_ITEMS } from "../../lib/constellations";
import { useTranslation } from "../../hooks/useTranslation";
import { useStore } from "../../store/useStore";
import { XpBadge } from "../atoms/XpBadge";

type MobileContextStripProps = {
  readonly onOpenChallengeSheet: () => void;
  readonly onOpenConstellationsSheet: () => void;
  readonly onBackFromPlanet: () => void;
  readonly onResetToStart: () => void;
};

export const MobileContextStrip = ({
  onOpenChallengeSheet,
  onOpenConstellationsSheet,
  onBackFromPlanet,
  onResetToStart,
}: MobileContextStripProps) => {
  const { locale, t, bodyName } = useTranslation();
  const activeBody = useStore((s) => s.activeBody);
  const selectedConstellation = useStore((s) => s.selectedConstellation);

  const constellationLabel = selectedConstellation
    ? (CONSTELLATION_MENU_ITEMS.find((i) => i.id === selectedConstellation)?.[
        locale === "sv" ? "labelSv" : "labelEn"
      ] ?? selectedConstellation)
    : null;

  const renderLeft = () => {
    if (selectedConstellation !== null) {
      return (
        <button
          type="button"
          onClick={onOpenConstellationsSheet}
          className="flex items-center gap-0.5 text-xs text-white/65 transition hover:text-white/90"
        >
          <ChevronLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {t.ui.constellations}
        </button>
      );
    }
    if (activeBody !== null) {
      return (
        <button
          type="button"
          onClick={onBackFromPlanet}
          className="flex items-center gap-0.5 text-xs text-white/65 transition hover:text-white/90"
        >
          <ChevronLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {t.ui.universeSolarSystem}
        </button>
      );
    }
    return (
      <button
        type="button"
        onClick={onResetToStart}
        className="text-sm font-semibold tracking-tight text-white/90 transition hover:text-white"
      >
        {t.appTitle}
      </button>
    );
  };

  const renderCenter = () => {
    if (selectedConstellation !== null) {
      return (
        <span className="pointer-events-none absolute inset-x-0 text-center text-xs font-semibold text-white/80">
          {constellationLabel}
        </span>
      );
    }
    if (activeBody !== null) {
      return (
        <span className="pointer-events-none absolute inset-x-0 text-center text-xs font-semibold text-white/80">
          {bodyName(activeBody)}
        </span>
      );
    }
    return null;
  };

  return (
    <div className="pointer-events-auto fixed inset-x-0 top-0 z-20 flex items-center justify-between border-b border-white/8 bg-black/70 px-3 py-1.5 backdrop-blur-xl">
      <div className="relative z-10 min-w-0">{renderLeft()}</div>
      {renderCenter()}
      <button
        type="button"
        onClick={onOpenChallengeSheet}
        aria-label={t.learn.ui.xpPoints}
        className="pointer-events-auto relative z-10"
      >
        <XpBadge />
      </button>
    </div>
  );
};
