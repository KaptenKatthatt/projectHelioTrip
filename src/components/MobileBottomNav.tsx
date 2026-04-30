import { BookOpen, Globe2, MoreHorizontal, Stars, Trophy } from "lucide-react";
import type { GameMode } from "../lib/missions/types";
import { useTranslation } from "../hooks/useTranslation";
import type { MobileHudSheetId } from "../lib/mobileHudSheetIds";

type MobileBottomNavProps = {
  readonly openSheet: MobileHudSheetId | null;
  readonly onToggleSheet: (id: MobileHudSheetId) => void;
  readonly gameMode: GameMode;
  /** When a constellation is focused (Stjärnor) but the bottom sheet is closed, highlight Stars instead of Explore. */
  readonly starsContextActive: boolean;
};

const TABS: readonly {
  id: MobileHudSheetId;
  icon: typeof Globe2;
  labelKey: "explore" | "stars" | "learn" | "challenge" | "more";
}[] = [
  { id: "explore", icon: Globe2, labelKey: "explore" },
  { id: "stars", icon: Stars, labelKey: "stars" },
  { id: "learn", icon: BookOpen, labelKey: "learn" },
  { id: "challenge", icon: Trophy, labelKey: "challenge" },
  { id: "more", icon: MoreHorizontal, labelKey: "more" },
];

const tabIsActive = (
  tabId: MobileHudSheetId,
  openSheet: MobileHudSheetId | null,
  gameMode: GameMode,
  starsContextActive: boolean,
): boolean => {
  if (openSheet !== null) return openSheet === tabId;
  if (tabId === "learn") return gameMode === "learn";
  if (tabId === "challenge") return gameMode === "challenge";
  if (tabId === "explore")
    return gameMode === "explore" && !starsContextActive;
  if (tabId === "stars") return starsContextActive;
  return false;
};

export const MobileBottomNav = ({
  openSheet,
  onToggleSheet,
  gameMode,
  starsContextActive,
}: MobileBottomNavProps) => {
  const { t } = useTranslation();

  const labelFor = (key: (typeof TABS)[number]["labelKey"]): string => {
    if (key === "stars") return t.ui.bottomNavStars;
    if (key === "more") return t.ui.bottomNavMore;
    if (key === "explore") return t.phase3.gameMode.explore;
    if (key === "learn") return t.phase3.gameMode.learn;
    return t.phase3.gameMode.challenge;
  };

  return (
    <nav
      aria-label={t.phase3.gameMode.label}
      className="pointer-events-auto flex w-full items-center justify-around border-t border-white/10 bg-black/60 px-1 pt-1 backdrop-blur-xl pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      {TABS.map(({ id, icon: Icon, labelKey }) => {
        const active = tabIsActive(
          id,
          openSheet,
          gameMode,
          starsContextActive,
        );
        return (
          <button
            key={id}
            type="button"
            onClick={() => onToggleSheet(id)}
            aria-pressed={active}
            className={
              "flex min-w-0 flex-1 flex-col items-center gap-1 py-2 transition " +
              (active ? "text-white" : "text-white/45 hover:text-white/70")
            }
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden />
            <span className="truncate text-xs font-medium tracking-wide">
              {labelFor(labelKey)}
            </span>
            <span
              className={[
                "h-1 w-1 shrink-0 rounded-full transition",
                active
                  ? id === "learn"
                    ? "bg-cyan-400"
                    : id === "challenge"
                      ? "bg-emerald-400"
                      : "bg-white"
                  : "bg-transparent",
              ].join(" ")}
              aria-hidden
            />
          </button>
        );
      })}
    </nav>
  );
};
