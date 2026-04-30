import type { Locale } from "../../i18n/translations";
import type { GameMode } from "../missions/types";

type NarrativeHookType =
  | "persistence"
  | "mystery"
  | "collection_gap"
  | "daily_challenge";

type NarrativeHook = {
  readonly id: string;
  readonly type: NarrativeHookType;
  readonly copy: Record<Locale, string>;
};

export type NarrativeContext = {
  gameMode: GameMode;
  activeBody: string | null;
  activeMissionId: string | null;
  visitedCount: number;
  totalBodies: number;
};

// Three reusable hook templates covering persistence, mystery, and collection-gap loops.
const NARRATIVE_HOOKS: readonly NarrativeHook[] = [
  {
    id: "learn-select-planet",
    type: "persistence",
    copy: {
      sv: "Välj en planet och öppna Fakta-fliken för att lära dig mer och testa dina kunskaper.",
      en: "Select a planet and open the Facts tab to learn more and test your knowledge.",
    },
  },
  {
    id: "learn-facts-available",
    type: "mystery",
    copy: {
      sv: "Det finns faktakort om denna planet – tryck på Fakta för att utforska dem.",
      en: "There are fact cards for this planet — tap Facts to explore them.",
    },
  },
  {
    id: "collection-gap",
    type: "collection_gap",
    copy: {
      sv: "Du har besökt {visited} av {total} himlakroppar. Vilken utforskar du härnäst?",
      en: "You've visited {visited} of {total} bodies. Which one will you explore next?",
    },
  },
  {
    id: "daily-challenge-ready",
    type: "daily_challenge",
    copy: {
      sv: "Dagens utmaning väntar. Byt till uppdrag och se om du kan klara den i ett svep.",
      en: "Today's challenge is ready. Switch to Challenge mode and see if you can clear it in one run.",
    },
  },
];

export const resolveNarrativeHint = (
  context: NarrativeContext,
  dismissedIds: ReadonlySet<string>,
  locale: Locale,
): { id: string; text: string } | null => {
  const candidates = NARRATIVE_HOOKS.filter((h) => {
    if (dismissedIds.has(h.id)) return false;
    if (h.id === "learn-select-planet")
      return context.gameMode === "learn" && context.activeBody === null;
    if (h.id === "learn-facts-available")
      return context.gameMode === "learn" && context.activeBody !== null;
    if (h.id === "collection-gap")
      return context.visitedCount > 0 && context.visitedCount < context.totalBodies;
    if (h.id === "daily-challenge-ready")
      return context.gameMode === "challenge" && context.activeMissionId === null;
    return false;
  });

  const pick = candidates[0];
  if (!pick) return null;

  const text = pick.copy[locale]
    .replace("{visited}", String(context.visitedCount))
    .replace("{total}", String(context.totalBodies));

  return { id: pick.id, text };
};
