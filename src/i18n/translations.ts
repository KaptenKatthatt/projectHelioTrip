import type { PlanetId } from "../lib/planets";
import type { MoonId } from "../lib/moons";
import type { SatelliteId } from "../lib/satellites";
import { en } from "./locales/en";
import { sv } from "./locales/sv";

export type Locale = "en" | "sv";

export type Translation = {
  appTitle: string;
  tagline: string;
  /** Full headline on the boot loading overlay (LCP / shell). */
  loadingScreenTitle: string;
  planets: Record<PlanetId, string>;
  moons: Record<MoonId, string>;
  satellites: Record<SatelliteId, string>;
  ui: {
    travelTo: string;
    arriving: string;
    language: string;
    loading: string;
    distanceFromSun: string;
    distanceFromEarth: string;
    orbitPeriodAroundSun: string;
    orbitPeriodAroundEarth: string;
    unitDays: string;
    unitHour: string;
    unitHours: string;
    circumferenceRelativeToEarth: string;
    simDate: string;
    play: string;
    pause: string;
    speed: string;
    speedDaysPerSecond: string;
    planets: string;
    moons: string;
    resetTime: string;
    resetToToday: string;
    readOnWikipedia: string;
    parent: string;
    distanceFromParent: string;
    autopilot: string;
    freeFlight: string;
    clickToFly: string;
    escToRelease: string;
    freeFlightTouchHint: string;
    controls: string;
    controlMove: string;
    controlUpDown: string;
    controlBoost: string;
    controlExit: string;
    constellations: string;
    universes: string;
    focusStar: string;
    comingSoon: string;
    universeSolarSystem: string;
    universeMilkyWayOverview: string;
    showConstellationLines: string;
    hideConstellationLines: string;
    rotateConstellationLeft: string;
    rotateConstellationRight: string;
    minimizePanel: string;
    expandPanel: string;
    bodyInfo: string;
    bodyInfoShort: string;
    timeControls: string;
    start: string;
    aboutOpen: string;
    aboutTitle: string;
    aboutClose: string;
    aboutP1: string;
    aboutP2: string;
    aboutP3: string;
    aboutP4: string;
    aboutAttribution: string;
    footerLinkAuthor: string;
    footerLinkGithub: string;
    bottomNavStars: string;
    bottomNavMore: string;
    constellationSeasonYearRound: string;
    constellationSeasonWinter: string;
    constellationSeasonSpring: string;
    constellationSeasonSummer: string;
    constellationSeasonAutumn: string;
  };
  phase3: {
    gameMode: {
      label: string;
      explore: string;
      learn: string;
      challenge: string;
      exploreDescription: string;
      learnDescription: string;
      challengeDescription: string;
    };
    missionCard: {
      activeMission: string;
      noMission: string;
      pickMission: string;
      stepProgress: string;
      stepCompleted: string;
      missionCompleted: string;
      abandon: string;
      backToExplore: string;
      confirmLeaveMission: string;
      confirmAbandonMission: string;
      confirmAction: string;
      cancelAction: string;
    };
    progressPanel: {
      title: string;
      visited: string;
      achievementsTitle: string;
      noAchievements: string;
    };
    shareLink: {
      copyLabel: string;
      copied: string;
      restoredToast: string;
    };
    achievements: {
      first_planet: string;
      first_moon: string;
      first_satellite: string;
      first_constellation: string;
      first_free_flight: string;
      first_mission_completed: string;
      unlocked: string;
    };
    missions: {
      solar_system_start: { title: string; description: string };
      jupiter_moons: { title: string; description: string };
      time_travel_short: { title: string; description: string };
      iss_hunt: { title: string; description: string };
      free_flight_loop: { title: string; description: string };
      water_hunt: { title: string; description: string };
      gravity_sling: { title: string; description: string };
    };
    steps: Record<string, string>;
  };
  learn: {
    ui: {
      factsTab: string;
      factsTabShort: string;
      learnMoreTab: string;
      compareSize: string;
      compareSizeShort: string;
      testYourself: string;
      levelMiddle: string;
      levelUpper: string;
      quizStars: string;
      quizHint: string;
      newTitle: string;
      xpUntilNext: string;
      narratorAstra: string;
      narratorColleague: string;
      constellationStory: string;
      constellationFindIt: string;
      constellationFunFact: string;
      quizCorrect: string;
      quizTryAgain: string;
      xpPoints: string;
      levelUp: string;
      noFactCards: string;
      quizFillPlaceholder: string;
      quizSubmit: string;
      openFactsCta: string;
      selectPlanetForFacts: string;
      railToggleOpen: string;
      railToggleClose: string;
    };
    xpTitles: {
      rookie: string;
      stargazer: string;
      space_explorer: string;
      astronomy_cadet: string;
      space_scientist: string;
      solar_system_expert: string;
      galactic_guide: string;
      water_hunter: string;
      orbital_mechanic: string;
    };
  };
};

export const translations: Record<Locale, Translation> = { en, sv };

const DEFAULT_LOCALE: Locale = "sv";

export const SUPPORTED_LOCALES: readonly Locale[] = ["sv", "en"];

export const detectLocale = (): Locale => {
  if (typeof navigator === "undefined") return DEFAULT_LOCALE;
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith("sv")) return "sv";
  if (lang.startsWith("en")) return "en";
  return DEFAULT_LOCALE;
};

export const isLocale = (value: unknown): value is Locale =>
  value === "sv" || value === "en";
