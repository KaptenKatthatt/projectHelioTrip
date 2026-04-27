import { useTranslation } from "../hooks/useTranslation";
import { SUPPORTED_LOCALES } from "../i18n/translations";
import type { Locale } from "../i18n/translations";

const SwedishFlag = () => (
  <svg viewBox="0 0 16 10" className="h-4 w-6 rounded-sm" aria-hidden>
    <rect width="16" height="10" fill="#006aa7" />
    <rect x="5" width="2" height="10" fill="#fecc00" />
    <rect y="4" width="16" height="2" fill="#fecc00" />
  </svg>
);

const UsaFlag = () => (
  <svg viewBox="0 0 19 10" className="h-4 w-6 rounded-sm" aria-hidden>
    <rect width="19" height="10" fill="#b22234" />
    {[1, 3, 5, 7, 9].map((y) => (
      <rect key={y} y={y} width="19" height="1" fill="#ffffff" />
    ))}
    <rect width="8" height="5" fill="#3c3b6e" />
  </svg>
);

const FLAG_LABELS: Record<Locale, string> = {
  sv: "Svenska",
  en: "English",
};

const renderFlag = (locale: Locale) => {
  if (locale === "sv") return <SwedishFlag />;
  return <UsaFlag />;
};

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
          aria-label={FLAG_LABELS[l]}
          title={FLAG_LABELS[l]}
          className={
            "flex items-center justify-center rounded-lg px-2 py-1 transition " +
            (locale === l
              ? "bg-white/90 ring-1 ring-white"
              : "opacity-70 hover:opacity-100")
          }
          style={{ filter: "saturate(0.7)" }}
        >
          {renderFlag(l)}
        </button>
      ))}
    </div>
  );
};
