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
  const { locale } = useTranslation();
  const selectedConstellation = useStore((s) => s.selectedConstellation);
  const focusSkyTarget = useStore((s) => s.focusSkyTarget);
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
          <button
            key={item.id}
            type="button"
            onClick={() => {
              focusSkyTarget(item.id);
              onPick?.();
            }}
            className={
              "w-full rounded-lg px-2.5 py-1.5 text-left text-sm transition " +
              (isActive
                ? "bg-white/15 text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white")
            }
          >
            <span className="truncate">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
