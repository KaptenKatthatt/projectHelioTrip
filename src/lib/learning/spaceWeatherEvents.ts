import type { BodyId } from "../bodies";

export type SpaceWeatherEvent = {
  readonly id: string;
  readonly dayOfWeek: number;
  readonly bodyId: BodyId | null;
  readonly sv: string;
  readonly en: string;
};

const WEEKLY_EVENTS: readonly SpaceWeatherEvent[] = [
  {
    id: "aurora-io",
    dayOfWeek: 1,
    bodyId: "io",
    sv: "Rymdväder: Io laddar upp Jupiters aurora i dag.",
    en: "Space weather: Io is fueling Jupiter's aurora today.",
  },
  {
    id: "sunspots",
    dayOfWeek: 2,
    bodyId: "sun",
    sv: "Rymdväder: Solfläcksspaning - jämför Solen och Jorden.",
    en: "Space weather: Sunspot watch - compare the Sun and Earth.",
  },
  {
    id: "titan-haze",
    dayOfWeek: 3,
    bodyId: "titan",
    sv: "Rymdväder: Titans dis skiftar - kika på Saturnus familj.",
    en: "Space weather: Titan haze is shifting - check Saturn's family.",
  },
  {
    id: "mars-dust",
    dayOfWeek: 4,
    bodyId: "mars",
    sv: "Rymdväder: Dammstormar på Mars står i fokus i dag.",
    en: "Space weather: Mars dust storms are in focus today.",
  },
  {
    id: "neptune-winds",
    dayOfWeek: 5,
    bodyId: "neptune",
    sv: "Rymdväder: Neptunus vindband är dagens observationsmål.",
    en: "Space weather: Neptune wind bands are today's target.",
  },
  {
    id: "saturn-rings",
    dayOfWeek: 6,
    bodyId: "saturn",
    sv: "Rymdväder: Ringlördag - undersök Saturnus ringplan.",
    en: "Space weather: Ring Saturday - inspect Saturn's ring plane.",
  },
  {
    id: "moon-tides",
    dayOfWeek: 0,
    bodyId: "moon",
    sv: "Rymdväder: Månens gravitationsdrag är veckans final.",
    en: "Space weather: Lunar gravity pulls close out the week.",
  },
];

export const getSpaceWeatherEventForDate = (
  date: Date,
): SpaceWeatherEvent | null => {
  const day = date.getDay();
  return WEEKLY_EVENTS.find((event) => event.dayOfWeek === day) ?? null;
};
