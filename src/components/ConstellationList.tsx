import { useMemo } from "react";
import { CONSTELLATION_MENU_ITEMS } from "../lib/constellations";
import { useStore } from "../store/useStore";
import { useTranslation } from "../hooks/useTranslation";

type ConstellationListProps = {
  readonly className?: string;
  readonly onPick?: () => void;
};

export const ConstellationList = ({
  className,
  onPick,
}: ConstellationListProps) => {
  const { locale, t } = useTranslation();
  const selectedConstellation = useStore((s) => s.selectedConstellation);
  const constellationLinesVisible = useStore(
    (s) => s.constellationLinesVisible,
  );
  const focusSkyTarget = useStore((s) => s.focusSkyTarget);
  const toggleConstellationLinesVisible = useStore(
    (s) => s.toggleConstellationLinesVisible,
  );
  const constellationItems = useMemo(
    () =>
      CONSTELLATION_MENU_ITEMS.map((item) => ({
        id: item.id,
        label: locale === "sv" ? item.labelSv : item.labelEn,
      })),
    [locale],
  );

  return (
    <div
      className={
        "flex max-h-64 flex-col gap-0.5 overflow-y-auto pr-1 " +
        (className ?? "")
      }
    >
      {constellationItems.map((item) => {
        const isActive = selectedConstellation === item.id;
        return (
          <div
            key={item.id}
            className={
              "flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition " +
              (isActive
                ? "bg-white/15 text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white")
            }
          >
            <button
              type="button"
              onClick={() => {
                focusSkyTarget(item.id);
                onPick?.();
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
                    "rounded-md border px-1.5 py-0.5 text-[10px] leading-none transition " +
                    (constellationLinesVisible
                      ? "border-cyan-200/60 bg-cyan-300/20 text-cyan-100"
                      : "border-white/25 bg-transparent text-white/55 hover:text-white/80")
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
  );
};
