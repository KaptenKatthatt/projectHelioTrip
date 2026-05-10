import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { useTranslation } from "../../hooks/useTranslation";
import { useStore } from "../../store/useStore";
import { GravityLabControls } from "../molecules/GravityLabControls";
import { GravityDropLab } from "./GravityDropLab";

const labTabButtonClass = (selected: boolean): string =>
  [
    "pointer-events-auto flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all",
    selected
      ? "bg-white/15 text-white shadow-sm"
      : "text-white/50 hover:text-white/80 hover:bg-white/8",
  ].join(" ");

export const LabOverlayContent = () => {
  const activeLabGame = useStore((s) => s.activeLabGame);
  const setActiveLabGame = useStore((s) => s.setActiveLabGame);
  const { t } = useTranslation();
  const lab = t.learn.labAccordion;

  return (
    <div className="flex flex-col gap-3">
      <div
        role="tablist"
        data-testid="lab-game-switcher"
        aria-label={`${lab.dropTabLabel} / ${lab.orbitTabLabel}`}
        className="flex shrink-0 gap-1 rounded-xl bg-white/5 p-1"
      >
        <button
          type="button"
          role="tab"
          data-testid="lab-tab-drop"
          aria-selected={activeLabGame === "drop"}
          onClick={() => setActiveLabGame("drop")}
          className={labTabButtonClass(activeLabGame === "drop")}
        >
          <span className="shrink-0 text-base leading-none" aria-hidden>
            🍎
          </span>
          <span className="truncate">{lab.dropTabLabel}</span>
        </button>
        <button
          type="button"
          role="tab"
          data-testid="lab-tab-orbit"
          aria-selected={activeLabGame === "orbit"}
          onClick={() => setActiveLabGame("orbit")}
          className={labTabButtonClass(activeLabGame === "orbit")}
        >
          <span className="shrink-0 text-base leading-none" aria-hidden>
            ☀️
          </span>
          <span className="truncate">{lab.orbitTabLabel}</span>
        </button>
      </div>

      {activeLabGame === "drop" ? <GravityDropLab /> : null}
      {activeLabGame === "orbit" ? (
        <div className="flex flex-col gap-4">
          <GravityLabControls embedded />
        </div>
      ) : null}
    </div>
  );
};

export const LabOverlay = () => {
  const layoutTier = useResponsiveLayout();
  const activeLabGame = useStore((s) => s.activeLabGame);

  if (layoutTier === "compact") {
    return (
      <div className="pointer-events-none fixed inset-x-0 top-8 bottom-0 z-20">
        <div className="pointer-events-auto h-full rounded-2xl border border-white/10 bg-black/60 p-4 backdrop-blur-xl">
          <LabOverlayContent />
        </div>
      </div>
    );
  }

  if (activeLabGame === "orbit") {
    return (
      <div className="pointer-events-none fixed right-4 bottom-20 z-20 w-72">
        <div className="pointer-events-auto rounded-2xl border border-white/10 bg-black/60 p-4 backdrop-blur-xl">
          <LabOverlayContent />
        </div>
      </div>
    );
  }

  if (layoutTier === "medium") {
    return (
      <div className="pointer-events-none fixed inset-x-4 top-16 bottom-20 z-20">
        <div className="custom-scrollbar pointer-events-auto h-full overflow-y-auto rounded-2xl border border-white/10 bg-black/60 p-4 backdrop-blur-xl">
          <LabOverlayContent />
        </div>
      </div>
    );
  }

  return (
    <div className="pointer-events-none fixed inset-x-4 top-16 bottom-20 z-20 max-w-md mx-auto">
      <div className="custom-scrollbar pointer-events-auto h-full overflow-y-auto rounded-2xl border border-white/10 bg-black/60 p-4 backdrop-blur-xl">
        <LabOverlayContent />
      </div>
    </div>
  );
};
