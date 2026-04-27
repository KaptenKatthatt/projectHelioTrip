import type { MissionDefinition } from "./types";

export const MISSION_DEFINITIONS: ReadonlyArray<MissionDefinition> = [
  {
    id: "solar_system_start",
    availableModes: ["challenge", "learn"],
    titleKey: "solar_system_start.title",
    descriptionKey: "solar_system_start.description",
    ordered: true,
    steps: [
      {
        id: "visit_earth",
        trigger: { kind: "visit_body", bodyId: "earth" },
        copyKey: "solar_system_start.visit_earth",
      },
      {
        id: "visit_mars",
        trigger: { kind: "visit_body", bodyId: "mars" },
        copyKey: "solar_system_start.visit_mars",
      },
    ],
  },
  {
    id: "jupiter_moons",
    availableModes: ["challenge"],
    titleKey: "jupiter_moons.title",
    descriptionKey: "jupiter_moons.description",
    ordered: false,
    steps: [
      {
        id: "visit_io",
        trigger: { kind: "visit_body", bodyId: "io" },
        copyKey: "jupiter_moons.visit_io",
      },
      {
        id: "visit_europa",
        trigger: { kind: "visit_body", bodyId: "europa" },
        copyKey: "jupiter_moons.visit_europa",
      },
      {
        id: "visit_ganymede",
        trigger: { kind: "visit_body", bodyId: "ganymede" },
        copyKey: "jupiter_moons.visit_ganymede",
      },
    ],
  },
  {
    id: "time_travel_short",
    availableModes: ["challenge", "learn"],
    titleKey: "time_travel_short.title",
    descriptionKey: "time_travel_short.description",
    ordered: false,
    steps: [
      {
        id: "speed_up",
        trigger: { kind: "time_scale_at_least", minimumDaysPerSecond: 30 },
        copyKey: "time_travel_short.speed_up",
      },
    ],
  },
  {
    id: "iss_hunt",
    availableModes: ["challenge"],
    titleKey: "iss_hunt.title",
    descriptionKey: "iss_hunt.description",
    ordered: false,
    steps: [
      {
        id: "visit_iss",
        trigger: { kind: "visit_body", bodyId: "iss" },
        copyKey: "iss_hunt.visit_iss",
      },
    ],
  },
  {
    id: "free_flight_loop",
    availableModes: ["challenge"],
    titleKey: "free_flight_loop.title",
    descriptionKey: "free_flight_loop.description",
    ordered: true,
    steps: [
      {
        id: "enter_free",
        trigger: { kind: "navigation_mode_is", mode: "free" },
        copyKey: "free_flight_loop.enter_free",
      },
      {
        id: "return_cinematic",
        trigger: { kind: "navigation_mode_is", mode: "cinematic" },
        copyKey: "free_flight_loop.return_cinematic",
      },
    ],
  },
];

export const getMissionDefinition = (
  id: string,
): MissionDefinition | undefined =>
  MISSION_DEFINITIONS.find((mission) => mission.id === id);

export const isMissionId = (value: unknown): value is string =>
  typeof value === "string" &&
  MISSION_DEFINITIONS.some((mission) => mission.id === value);
