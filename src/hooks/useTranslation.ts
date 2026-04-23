import { useCallback } from 'react';
import { useStore } from '../store/useStore';
import type { PlanetId } from '../lib/planets';
import type { MoonId } from '../lib/moons';
import type { SatelliteId } from '../lib/satellites';
import { isMoonId, isSatelliteId, type BodyId } from '../lib/bodies';
import { translations } from '../i18n/translations';
import type { Locale, Translation } from '../i18n/translations';

export type UseTranslationResult = {
  locale: Locale;
  t: Translation;
  planetName: (id: PlanetId) => string;
  moonName: (id: MoonId) => string;
  satelliteName: (id: SatelliteId) => string;
  bodyName: (id: BodyId) => string;
  setLocale: (locale: Locale) => void;
};

export const useTranslation = (): UseTranslationResult => {
  const locale = useStore((s) => s.locale);
  const setLocale = useStore((s) => s.setLocale);

  const t = translations[locale];

  const planetName = useCallback(
    (id: PlanetId): string => t.planets[id],
    [t],
  );

  const moonName = useCallback((id: MoonId): string => t.moons[id], [t]);

  const satelliteName = useCallback(
    (id: SatelliteId): string => t.satellites[id],
    [t],
  );

  const bodyName = useCallback(
    (id: BodyId): string => {
      if (isSatelliteId(id)) return t.satellites[id];
      if (isMoonId(id)) return t.moons[id];
      return t.planets[id as PlanetId];
    },
    [t],
  );

  return {
    locale,
    t,
    planetName,
    moonName,
    satelliteName,
    bodyName,
    setLocale,
  };
};
