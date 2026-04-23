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

export type StarFocusId = 'polaris';

export type ConstellationMenuId = ConstellationId | StarFocusId;

export type ConstellationMenuItem = {
  readonly id: ConstellationMenuId;
  readonly labelSv: string;
  readonly labelEn: string;
  readonly kind: 'constellation' | 'star';
};

export const CONSTELLATION_MENU_ITEMS: readonly ConstellationMenuItem[] = [
  { id: 'orion', labelSv: 'Orion', labelEn: 'Orion', kind: 'constellation' },
  {
    id: 'ursaMajor',
    labelSv: 'Stora Björn',
    labelEn: 'Ursa Major',
    kind: 'constellation',
  },
  {
    id: 'ursaMinor',
    labelSv: 'Lilla Björn',
    labelEn: 'Ursa Minor',
    kind: 'constellation',
  },
  {
    id: 'cassiopeia',
    labelSv: 'Cassiopeja',
    labelEn: 'Cassiopeia',
    kind: 'constellation',
  },
  { id: 'cygnus', labelSv: 'Svanen', labelEn: 'Cygnus', kind: 'constellation' },
  {
    id: 'scorpius',
    labelSv: 'Skorpionen',
    labelEn: 'Scorpius',
    kind: 'constellation',
  },
  { id: 'leo', labelSv: 'Lejonet', labelEn: 'Leo', kind: 'constellation' },
  {
    id: 'taurus',
    labelSv: 'Oxen',
    labelEn: 'Taurus',
    kind: 'constellation',
  },
  {
    id: 'gemini',
    labelSv: 'Tvillingarna',
    labelEn: 'Gemini',
    kind: 'constellation',
  },
  {
    id: 'sagittarius',
    labelSv: 'Skytten',
    labelEn: 'Sagittarius',
    kind: 'constellation',
  },
  { id: 'crux', labelSv: 'Södra korset', labelEn: 'Crux', kind: 'constellation' },
  {
    id: 'canisMajor',
    labelSv: 'Stora hunden',
    labelEn: 'Canis Major',
    kind: 'constellation',
  },
  {
    id: 'pegasus',
    labelSv: 'Pegasus',
    labelEn: 'Pegasus',
    kind: 'constellation',
  },
  {
    id: 'andromeda',
    labelSv: 'Andromeda',
    labelEn: 'Andromeda',
    kind: 'constellation',
  },
  {
    id: 'aquarius',
    labelSv: 'Vattumannen',
    labelEn: 'Aquarius',
    kind: 'constellation',
  },
  {
    id: 'polaris',
    labelSv: 'Polstjärnan',
    labelEn: 'Polaris',
    kind: 'star',
  },
];

