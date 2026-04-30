import type { Locale } from "../../i18n/translations";

export type DailyChallenge = {
  readonly id: string;
  readonly type: "position" | "compare" | "time";
  readonly title: Record<Locale, string>;
  readonly description: Record<Locale, string>;
};

// Editorial pool — one challenge per pool slot, rotated daily.
const DAILY_CHALLENGE_POOL: readonly DailyChallenge[] = [
  {
    id: "closest-to-earth",
    type: "position",
    title: { sv: "Närmast jorden idag", en: "Closest to Earth today" },
    description: {
      sv: "Hitta vilken planet som befinner sig närmast Jorden just nu.",
      en: "Find which planet is currently closest to Earth.",
    },
  },
  {
    id: "jupiter-vs-earth",
    type: "compare",
    title: { sv: "Jämför storlekar", en: "Compare sizes" },
    description: {
      sv: "Öppna Jupiter och Jordens storleksjämförelse — hur många jordar ryms i Jupiter?",
      en: "Open Jupiter and compare its size to Earth — how many Earths fit inside?",
    },
  },
  {
    id: "time-2100",
    type: "time",
    title: { sv: "Spola till år 2100", en: "Fast-forward to 2100" },
    description: {
      sv: "Ställ in tidssimuleringen till år 2100 och se var planeterna befinner sig.",
      en: "Set the time simulation to year 2100 and see where the planets are.",
    },
  },
  {
    id: "longest-day",
    type: "compare",
    title: { sv: "Längsta dagen", en: "The longest day" },
    description: {
      sv: "Vilken planet har den längsta dagen? Kolla rotatonstiden i Info-fliken.",
      en: "Which planet has the longest day? Check the rotation in the Info tab.",
    },
  },
  {
    id: "saturn-rings",
    type: "position",
    title: { sv: "Saturnus ringar", en: "Saturn's rings" },
    description: {
      sv: "Välj Saturnus och rotera planeten för att se ringarna från olika vinklar.",
      en: "Select Saturn and rotate to see its rings from different angles.",
    },
  },
  {
    id: "fast-vs-slow",
    type: "time",
    title: { sv: "Snabb mot långsam", en: "Fast vs slow" },
    description: {
      sv: "Observera hur snabbt Merkurius rör sig jämfört med Neptunus — öka tidshastigheten!",
      en: "Watch how fast Mercury moves compared to Neptune — speed up time!",
    },
  },
  {
    id: "smallest-planet",
    type: "compare",
    title: { sv: "Minsta planeten", en: "The smallest planet" },
    description: {
      sv: "Hitta den minsta planeten i solsystemet och jämför den med Jorden.",
      en: "Find the smallest planet in the solar system and compare it to Earth.",
    },
  },
];

const dayOfYear = (date: Date): number => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86_400_000);
};

export const getDailyChallenge = (date: Date): DailyChallenge | null => {
  if (DAILY_CHALLENGE_POOL.length === 0) return null;
  const index = dayOfYear(date) % DAILY_CHALLENGE_POOL.length;
  return DAILY_CHALLENGE_POOL[index] ?? null;
};
