import { useTranslation } from '../../hooks/useTranslation';

export const ScrapbookEmptyState = () => {
  const { t } = useTranslation();
  return (
  <div className="flex h-full flex-col items-center justify-center text-white/50">
    <div className="mb-4 rounded-full bg-white/5 p-6">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-20"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </svg>
    </div>
    <p>{t.scrapbook.emptyTitle}</p>
    <p className="mt-1 text-sm opacity-60">
      {t.scrapbook.emptyBody}
    </p>
  </div>
  );
};
