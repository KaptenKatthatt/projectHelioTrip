import type { PlanetId } from './planets';
import type { MoonId } from './moons';
import type { SatelliteId } from './satellites';
import { isMoonId, isSatelliteId, type BodyId } from './bodies';
import type { Locale } from '../i18n/translations';

/**
 * Locale-specific Wikipedia article slugs per planet. Uses the
 * disambiguated titles where the short name would resolve to a
 * different article (e.g. "Mercury" → god, not planet).
 */
const PLANET_SLUGS: Record<Locale, Record<PlanetId, string>> = {
  en: {
    sun: 'Sun',
    mercury: 'Mercury_(planet)',
    venus: 'Venus',
    earth: 'Earth',
    mars: 'Mars',
    jupiter: 'Jupiter',
    saturn: 'Saturn',
    uranus: 'Uranus',
    neptune: 'Neptune',
    pluto: 'Pluto',
  },
  sv: {
    sun: 'Solen',
    mercury: 'Merkurius',
    venus: 'Venus_(planet)',
    earth: 'Jorden',
    mars: 'Mars_(planet)',
    jupiter: 'Jupiter_(planet)',
    saturn: 'Saturnus_(planet)',
    uranus: 'Uranus_(planet)',
    neptune: 'Neptunus',
    pluto: 'Pluto_(dvärgplanet)',
  },
};

const MOON_SLUGS: Record<Locale, Record<MoonId, string>> = {
  en: {
    moon: 'Moon',
    io: 'Io_(moon)',
    europa: 'Europa_(moon)',
    ganymede: 'Ganymede_(moon)',
    callisto: 'Callisto_(moon)',
    titan: 'Titan_(moon)',
    triton: 'Triton_(moon)',
  },
  sv: {
    moon: 'Månen',
    io: 'Io_(måne)',
    europa: 'Europa_(måne)',
    ganymede: 'Ganymedes',
    callisto: 'Callisto_(måne)',
    titan: 'Titan_(måne)',
    triton: 'Triton_(måne)',
  },
};

const SATELLITE_SLUGS: Record<Locale, Record<SatelliteId, string>> = {
  en: {
    iss: 'International_Space_Station',
  },
  sv: {
    iss: 'Internationella_rymdstationen',
  },
};

export const getWikipediaUrl = (id: BodyId, locale: Locale): string => {
  let slug: string;
  if (isSatelliteId(id)) {
    slug = SATELLITE_SLUGS[locale][id];
  } else if (isMoonId(id)) {
    slug = MOON_SLUGS[locale][id];
  } else {
    slug = PLANET_SLUGS[locale][id as PlanetId];
  }
  return `https://${locale}.wikipedia.org/wiki/${encodeURI(slug)}`;
};
