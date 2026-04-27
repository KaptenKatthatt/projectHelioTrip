import { useMemo } from "react";
import {
  CONSTELLATION_MENU_ITEMS,
  CONSTELLATION_SEASON_ORDER,
  type ConstellationMenuItem,
  type ConstellationSeasonId,
} from "../lib/constellations";
import { useStore } from "../store/useStore";
import { useTranslation } from "../hooks/useTranslation";

const SEASON_LABEL_KEY: Record<
  ConstellationSeasonId,
  | "constellationSeasonYearRound"
  | "constellationSeasonWinter"
  | "constellationSeasonSpring"
  | "constellationSeasonSummer"
  | "constellationSeasonAutumn"
> = {
  yearRound: "constellationSeasonYearRound",
  winter: "constellationSeasonWinter",
  spring: "constellationSeasonSpring",
  summer: "constellationSeasonSummer",
  autumn: "constellationSeasonAutumn",
};

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
  const focusSkyTarget = useStore((s) => s.focusSkyTarget);

  const sections = useMemo(() => {
    const bySeason = new Map<ConstellationSeasonId, ConstellationMenuItem[]>();
    for (const season of CONSTELLATION_SEASON_ORDER) {
      bySeason.set(season, []);
    }
    for (const item of CONSTELLATION_MENU_ITEMS) {
      bySeason.get(item.season)!.push(item);
    }
    return CONSTELLATION_SEASON_ORDER.map((season) => ({
      season,
      title: t.ui[SEASON_LABEL_KEY[season]],
      items: bySeason.get(season)!,
    }));
  }, [t.ui]);

  return (
    <div
      className={
        "flex max-h-64 flex-col gap-2 overflow-y-auto pr-1 " + (className ?? "")
      }
    >
      {sections.map(({ season, title, items }) => (
        <div key={season} className="flex flex-col gap-0.5">
          <div className="px-2.5 pt-1 text-[0.65rem] font-medium uppercase tracking-wide text-white/45">
            {title}
          </div>
          {items.map((item) => {
            const isActive = selectedConstellation === item.id;
            const primary =
              locale === "sv" ? item.labelSv : item.labelEn;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  focusSkyTarget(item.id);
                  onPick?.();
                }}
                className={
                  "w-full rounded-lg px-2.5 py-1.5 text-left transition " +
                  (isActive
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white")
                }
              >
                <span className="block truncate text-sm">{primary}</span>
                <span className="block truncate text-xs text-white/55">
                  {item.labelLatin}
                </span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};
