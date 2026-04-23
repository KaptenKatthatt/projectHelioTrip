export type StarWarsSystemId =
  | 'alderaan-system'
  | 'yavin-system'
  | 'hoth-system'
  | 'endor-system'
  | 'coruscant-system'
  | 'naboo-system'
  | 'tatooine-system'
  | 'kamino-system'
  | 'geonosis-system'
  | 'kashyyyk-system'
  | 'mustafar-system';

export type StarWarsBodyId =
  | 'alderaan'
  | 'death-star'
  | 'yavin'
  | 'yavin-4'
  | 'hoth'
  | 'endor'
  | 'kef-bir'
  | 'coruscant'
  | 'naboo'
  | 'tatooine'
  | 'kamino'
  | 'geonosis'
  | 'kashyyyk'
  | 'mustafar';

export type StarWarsBodyNode = {
  readonly id: StarWarsBodyId;
  readonly labelEn: string;
  readonly labelSv: string;
  readonly color: string;
  readonly radius: number;
  readonly position: readonly [number, number, number];
};

export type StarWarsSystem = {
  readonly id: StarWarsSystemId;
  readonly labelEn: string;
  readonly labelSv: string;
  readonly color: string;
  readonly bodies: readonly StarWarsBodyNode[];
};

export const STAR_WARS_SYSTEMS: readonly StarWarsSystem[] = [
  {
    id: 'alderaan-system',
    labelEn: 'Alderaan System',
    labelSv: 'Alderaan-systemet',
    color: '#91b7ff',
    bodies: [
      {
        id: 'alderaan',
        labelEn: 'Alderaan',
        labelSv: 'Alderaan',
        color: '#86b7ff',
        radius: 2.0,
        position: [220, 12, -120],
      },
      {
        id: 'death-star',
        labelEn: 'Death Star',
        labelSv: 'Dödsstjärnan',
        color: '#aeb4bf',
        radius: 0.9,
        position: [228, 14, -114],
      },
    ],
  },
  {
    id: 'yavin-system',
    labelEn: 'Yavin System',
    labelSv: 'Yavin-systemet',
    color: '#85b15f',
    bodies: [
      {
        id: 'yavin-4',
        labelEn: 'Yavin 4',
        labelSv: 'Yavin 4',
        color: '#7eb86d',
        radius: 1.4,
        position: [140, 10, -220],
      },
      {
        id: 'yavin',
        labelEn: 'Yavin',
        labelSv: 'Yavin',
        color: '#75a55f',
        radius: 2.4,
        position: [132, 8, -234],
      },
    ],
  },
  {
    id: 'hoth-system',
    labelEn: 'Hoth System',
    labelSv: 'Hoth-systemet',
    color: '#d8e6ff',
    bodies: [
      {
        id: 'hoth',
        labelEn: 'Hoth',
        labelSv: 'Hoth',
        color: '#e5eeff',
        radius: 1.8,
        position: [-80, 6, -260],
      },
    ],
  },
  {
    id: 'endor-system',
    labelEn: 'Endor System',
    labelSv: 'Endor-systemet',
    color: '#7fb173',
    bodies: [
      {
        id: 'endor',
        labelEn: 'Endor',
        labelSv: 'Endor',
        color: '#7fbe6c',
        radius: 1.3,
        position: [-240, 9, -120],
      },
      {
        id: 'kef-bir',
        labelEn: 'Kef Bir',
        labelSv: 'Kef Bir',
        color: '#7cb49c',
        radius: 1.15,
        position: [-232, 11, -114],
      },
    ],
  },
  {
    id: 'coruscant-system',
    labelEn: 'Coruscant System',
    labelSv: 'Coruscant-systemet',
    color: '#9ba7c7',
    bodies: [
      {
        id: 'coruscant',
        labelEn: 'Coruscant',
        labelSv: 'Coruscant',
        color: '#93a2cf',
        radius: 2.1,
        position: [40, 18, -70],
      },
    ],
  },
  {
    id: 'naboo-system',
    labelEn: 'Naboo System',
    labelSv: 'Naboo-systemet',
    color: '#7ac3b2',
    bodies: [
      {
        id: 'naboo',
        labelEn: 'Naboo',
        labelSv: 'Naboo',
        color: '#5cbca8',
        radius: 1.9,
        position: [82, 10, -144],
      },
    ],
  },
  {
    id: 'tatooine-system',
    labelEn: 'Tatooine System',
    labelSv: 'Tatooine-systemet',
    color: '#d9b56b',
    bodies: [
      {
        id: 'tatooine',
        labelEn: 'Tatooine',
        labelSv: 'Tatooine',
        color: '#d6a961',
        radius: 2.0,
        position: [312, 4, -36],
      },
    ],
  },
  {
    id: 'kamino-system',
    labelEn: 'Kamino System',
    labelSv: 'Kamino-systemet',
    color: '#7eb7d9',
    bodies: [
      {
        id: 'kamino',
        labelEn: 'Kamino',
        labelSv: 'Kamino',
        color: '#6aa7cf',
        radius: 1.95,
        position: [176, 16, 92],
      },
    ],
  },
  {
    id: 'geonosis-system',
    labelEn: 'Geonosis System',
    labelSv: 'Geonosis-systemet',
    color: '#cd8a58',
    bodies: [
      {
        id: 'geonosis',
        labelEn: 'Geonosis',
        labelSv: 'Geonosis',
        color: '#c67745',
        radius: 1.7,
        position: [228, 7, 28],
      },
    ],
  },
  {
    id: 'kashyyyk-system',
    labelEn: 'Kashyyyk System',
    labelSv: 'Kashyyyk-systemet',
    color: '#6aa36e',
    bodies: [
      {
        id: 'kashyyyk',
        labelEn: 'Kashyyyk',
        labelSv: 'Kashyyyk',
        color: '#5b995f',
        radius: 2.2,
        position: [-126, 14, 64],
      },
    ],
  },
  {
    id: 'mustafar-system',
    labelEn: 'Mustafar System',
    labelSv: 'Mustafar-systemet',
    color: '#e1734f',
    bodies: [
      {
        id: 'mustafar',
        labelEn: 'Mustafar',
        labelSv: 'Mustafar',
        color: '#e1583e',
        radius: 1.5,
        position: [34, 5, 212],
      },
    ],
  },
];

const STAR_WARS_BODY_MAP: ReadonlyMap<StarWarsBodyId, StarWarsBodyNode> = new Map(
  STAR_WARS_SYSTEMS.flatMap((system) =>
    system.bodies.map((body) => [body.id, body] as const),
  ),
);

const STAR_WARS_SYSTEM_BY_BODY_MAP: ReadonlyMap<StarWarsBodyId, StarWarsSystem> =
  new Map(
    STAR_WARS_SYSTEMS.flatMap((system) =>
      system.bodies.map((body) => [body.id, system] as const),
    ),
  );

export const getStarWarsBody = (
  id: StarWarsBodyId,
): StarWarsBodyNode | undefined => STAR_WARS_BODY_MAP.get(id);

export const getStarWarsSystemByBody = (
  id: StarWarsBodyId,
): StarWarsSystem | undefined => STAR_WARS_SYSTEM_BY_BODY_MAP.get(id);
