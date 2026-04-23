export type ConstellationId =
  | 'orion'
  | 'ursaMajor'
  | 'ursaMinor'
  | 'cassiopeia'
  | 'cygnus'
  | 'scorpius'
  | 'leo'
  | 'taurus'
  | 'gemini'
  | 'sagittarius'
  | 'crux'
  | 'canisMajor'
  | 'pegasus'
  | 'andromeda'
  | 'aquarius';

export type ConstellationMenuItem = {
  readonly id: ConstellationId;
  readonly labelSv: string;
  readonly labelEn: string;
};

export const CONSTELLATION_MENU_ITEMS: readonly ConstellationMenuItem[] = [
  { id: 'orion', labelSv: 'Orion', labelEn: 'Orion' },
  {
    id: 'ursaMajor',
    labelSv: 'Stora Björn',
    labelEn: 'Ursa Major',
  },
  {
    id: 'ursaMinor',
    labelSv: 'Lilla Björn',
    labelEn: 'Ursa Minor',
  },
  {
    id: 'cassiopeia',
    labelSv: 'Cassiopeja',
    labelEn: 'Cassiopeia',
  },
  { id: 'cygnus', labelSv: 'Svanen', labelEn: 'Cygnus' },
  {
    id: 'scorpius',
    labelSv: 'Skorpionen',
    labelEn: 'Scorpius',
  },
  { id: 'leo', labelSv: 'Lejonet', labelEn: 'Leo' },
  {
    id: 'taurus',
    labelSv: 'Oxen',
    labelEn: 'Taurus',
  },
  {
    id: 'gemini',
    labelSv: 'Tvillingarna',
    labelEn: 'Gemini',
  },
  {
    id: 'sagittarius',
    labelSv: 'Skytten',
    labelEn: 'Sagittarius',
  },
  { id: 'crux', labelSv: 'Södra korset', labelEn: 'Crux' },
  {
    id: 'canisMajor',
    labelSv: 'Stora hunden',
    labelEn: 'Canis Major',
  },
  {
    id: 'pegasus',
    labelSv: 'Pegasus',
    labelEn: 'Pegasus',
  },
  {
    id: 'andromeda',
    labelSv: 'Andromeda',
    labelEn: 'Andromeda',
  },
  {
    id: 'aquarius',
    labelSv: 'Vattumannen',
    labelEn: 'Aquarius',
  },
];

