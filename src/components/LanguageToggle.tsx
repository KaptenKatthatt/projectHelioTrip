import { useTranslation } from '../hooks/useTranslation';
import { SUPPORTED_LOCALES } from '../i18n/translations';

export const LanguageToggle = () => {
  const { locale, setLocale } = useTranslation();
  return (
    <div className="pointer-events-auto flex items-center gap-1 rounded-xl border border-white/10 bg-black/40 p-1 backdrop-blur-md">
      {SUPPORTED_LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          className={
            'rounded-lg px-2 py-1 text-xs font-medium uppercase tracking-[0.15em] transition ' +
            (locale === l
              ? 'bg-white text-black'
              : 'text-white/60 hover:text-white')
          }
        >
          {l}
        </button>
      ))}
    </div>
  );
};
