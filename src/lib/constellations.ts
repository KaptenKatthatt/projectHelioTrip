export type ConstellationId =
  | 'orion'
  | 'ursaMajor'
  | 'karlaVagnen'
  | 'ursaMinor'
  | 'cassiopeia'
  | 'cygnus'
  | 'scorpius'
  | 'leo'
  | 'taurus'
  | 'gemini'
  | 'sagittarius'
  | 'canisMajor'
  | 'pegasus'
  | 'andromeda'
  | 'aquarius'
  | 'lyra';

export type ConstellationSeasonId =
  | 'yearRound'
  | 'winter'
  | 'spring'
  | 'summer'
  | 'autumn';

export type ConstellationMenuItem = {
  readonly id: ConstellationId;
  readonly season: ConstellationSeasonId;
  readonly labelSv: string;
  readonly labelEn: string;
  readonly labelLatin: string;
};

export const CONSTELLATION_SEASON_ORDER: readonly ConstellationSeasonId[] = [
  'yearRound',
  'winter',
  'spring',
  'summer',
  'autumn',
] as const;

export const CONSTELLATION_MENU_ITEMS: readonly ConstellationMenuItem[] = [
  {
    id: 'ursaMajor',
    season: 'yearRound',
    labelSv: 'Stora björn / Karlavagnen',
    labelEn: 'Great Bear / Big Dipper',
    labelLatin: 'Ursa Major',
  },
  {
    id: 'karlaVagnen',
    season: 'yearRound',
    labelSv: 'Karlavagnen',
    labelEn: 'Big Dipper',
    labelLatin: 'Ursa Major',
  },
  {
    id: 'ursaMinor',
    season: 'yearRound',
    labelSv: 'Lilla björn',
    labelEn: 'Little Bear',
    labelLatin: 'Ursa Minor',
  },
  {
    id: 'cassiopeia',
    season: 'yearRound',
    labelSv: 'Cassiopeja',
    labelEn: 'Cassiopeia',
    labelLatin: 'Cassiopeia',
  },
  {
    id: 'orion',
    season: 'winter',
    labelSv: 'Orion',
    labelEn: 'Orion',
    labelLatin: 'Orion',
  },
  {
    id: 'taurus',
    season: 'winter',
    labelSv: 'Tjuren',
    labelEn: 'Taurus',
    labelLatin: 'Taurus',
  },
  {
    id: 'gemini',
    season: 'winter',
    labelSv: 'Tvillingarna',
    labelEn: 'Gemini',
    labelLatin: 'Gemini',
  },
  {
    id: 'canisMajor',
    season: 'winter',
    labelSv: 'Stora hund',
    labelEn: 'Great Dog',
    labelLatin: 'Canis Major',
  },
  {
    id: 'leo',
    season: 'spring',
    labelSv: 'Lejonet',
    labelEn: 'Leo',
    labelLatin: 'Leo',
  },
  {
    id: 'cygnus',
    season: 'summer',
    labelSv: 'Svanen',
    labelEn: 'Cygnus',
    labelLatin: 'Cygnus',
  },
  {
    id: 'scorpius',
    season: 'summer',
    labelSv: 'Skorpionen',
    labelEn: 'Scorpius',
    labelLatin: 'Scorpius',
  },
  {
    id: 'sagittarius',
    season: 'summer',
    labelSv: 'Skytten',
    labelEn: 'Sagittarius',
    labelLatin: 'Sagittarius',
  },
  {
    id: 'lyra',
    season: 'summer',
    labelSv: 'Lyran',
    labelEn: 'Lyra',
    labelLatin: 'Lyra',
  },
  {
    id: 'aquarius',
    season: 'autumn',
    labelSv: 'Vattumannen',
    labelEn: 'Aquarius',
    labelLatin: 'Aquarius',
  },
  {
    id: 'pegasus',
    season: 'autumn',
    labelSv: 'Pegasus',
    labelEn: 'Pegasus',
    labelLatin: 'Pegasus',
  },
  {
    id: 'andromeda',
    season: 'autumn',
    labelSv: 'Andromeda',
    labelEn: 'Andromeda',
    labelLatin: 'Andromeda',
  },
];
