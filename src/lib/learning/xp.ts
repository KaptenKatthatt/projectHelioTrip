export type TitleId =
  | 'rookie'
  | 'stargazer'
  | 'space_explorer'
  | 'astronomy_cadet'
  | 'space_scientist'
  | 'solar_system_expert'
  | 'galactic_guide'
  | 'water_hunter'
  | 'orbital_mechanic';

type XpTitle = {
  readonly id: TitleId;
  readonly xpRequired: number;
  readonly missionRequired?: string;
};

export const XP_TITLES: ReadonlyArray<XpTitle> = [
  { id: 'rookie',              xpRequired: 0 },
  { id: 'stargazer',           xpRequired: 100 },
  { id: 'space_explorer',      xpRequired: 300 },
  { id: 'astronomy_cadet',     xpRequired: 600 },
  { id: 'space_scientist',     xpRequired: 1000 },
  { id: 'solar_system_expert', xpRequired: 2000 },
  { id: 'galactic_guide',      xpRequired: 3500 },
  { id: 'water_hunter',        xpRequired: 0, missionRequired: 'water_hunt' },
  { id: 'orbital_mechanic',    xpRequired: 0, missionRequired: 'gravity_sling' },
];

export const XP_AWARDS = {
  bodyVisited: 10,
  bodyPatience: 15,
  missionStepCompleted: 15,
  quizThreeStars: 30,
  quizTwoStars: 20,
  quizOneStar: 10,
  missionCompleted: 50,
  adventureMissionCompleted: 60,
  constellationExplored: 20,
} as const;

export const resolveTitle = (
  xp: number,
  completedMissionIds: ReadonlyArray<string>,
): TitleId => {
  for (const t of [...XP_TITLES].reverse()) {
    if (t.missionRequired && completedMissionIds.includes(t.missionRequired)) {
      return t.id;
    }
  }
  let current: TitleId = 'rookie';
  for (const t of XP_TITLES) {
    if (t.missionRequired) continue;
    if (xp >= t.xpRequired) current = t.id;
  }
  return current;
};
