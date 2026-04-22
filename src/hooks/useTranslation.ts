import { useCallback } from 'react';
import { useStore } from '../store/useStore';
import type { PlanetId } from '../lib/planets';
import { translations } from '../i18n/translations';
import type { Locale, Translation } from '../i18n/translations';

export type UseTranslationResult = {
  locale: Locale;
  t: Translation;
  planetName: (id: PlanetId) => string;
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

  return { locale, t, planetName, setLocale };
};
