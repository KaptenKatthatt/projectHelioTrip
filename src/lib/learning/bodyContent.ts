import type { BodyId } from '../bodies';
import { SUN_FACT_CARDS } from './factCardData/sun';
import { MERCURY_FACT_CARDS } from './factCardData/mercury';
import { VENUS_FACT_CARDS } from './factCardData/venus';
import { EARTH_FACT_CARDS } from './factCardData/earth';
import { MARS_FACT_CARDS } from './factCardData/mars';
import { JUPITER_FACT_CARDS } from './factCardData/jupiter';
import { SATURN_FACT_CARDS } from './factCardData/saturn';
import { URANUS_FACT_CARDS } from './factCardData/uranus';
import { NEPTUNE_FACT_CARDS } from './factCardData/neptune';
import { PLUTO_FACT_CARDS } from './factCardData/pluto';
import { MOON_FACT_CARDS } from './factCardData/moon';
import { IO_FACT_CARDS } from './factCardData/io';
import { EUROPA_FACT_CARDS } from './factCardData/europa';
import { GANYMEDE_FACT_CARDS } from './factCardData/ganymede';
import { CALLISTO_FACT_CARDS } from './factCardData/callisto';
import { TITAN_FACT_CARDS } from './factCardData/titan';
import { TRITON_FACT_CARDS } from './factCardData/triton';
import { ISS_FACT_CARDS } from './factCardData/iss';
import { SPUTNIK_FACT_CARDS } from './factCardData/sputnik';

export type FactCardLevel = 'middle' | 'upper' | 'both';

export type FactCard = {
  readonly id: string;
  readonly bodyId: BodyId;
  readonly icon: string;
  readonly level: FactCardLevel;
  readonly title: { readonly sv: string; readonly en: string };
  readonly body: { readonly sv: string; readonly en: string };
};

const FACT_CARDS: ReadonlyArray<FactCard> = [
  ...SUN_FACT_CARDS,
  ...MERCURY_FACT_CARDS,
  ...VENUS_FACT_CARDS,
  ...EARTH_FACT_CARDS,
  ...MARS_FACT_CARDS,
  ...JUPITER_FACT_CARDS,
  ...SATURN_FACT_CARDS,
  ...URANUS_FACT_CARDS,
  ...NEPTUNE_FACT_CARDS,
  ...PLUTO_FACT_CARDS,
  ...MOON_FACT_CARDS,
  ...IO_FACT_CARDS,
  ...EUROPA_FACT_CARDS,
  ...GANYMEDE_FACT_CARDS,
  ...CALLISTO_FACT_CARDS,
  ...TITAN_FACT_CARDS,
  ...TRITON_FACT_CARDS,
  ...ISS_FACT_CARDS,
  ...SPUTNIK_FACT_CARDS,
];

export const getFactCardsForBody = (
  bodyId: BodyId,
  level: FactCardLevel,
): ReadonlyArray<FactCard> => {
  if (level === 'both') {
    return FACT_CARDS.filter((c) => c.bodyId === bodyId);
  }

  return FACT_CARDS.filter((c) => c.bodyId === bodyId && (c.level === 'both' || c.level === level));
};
