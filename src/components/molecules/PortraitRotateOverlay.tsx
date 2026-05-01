import { Smartphone } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export const PortraitRotateOverlay = () => {
  const { t } = useTranslation();

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-[hsl(232_44%_6%/0.92)] px-6 text-center text-[hsl(223_25%_91%)]"
      role="status"
      aria-live="polite"
    >
      <Smartphone
        className="h-10 w-10 shrink-0 text-[hsl(223_25%_91%)]"
        aria-hidden
      />
      <div className="max-w-sm space-y-2">
        <p className="text-base font-semibold tracking-tight">{t.ui.portraitOnlyTitle}</p>
        <p className="text-sm leading-snug text-[hsl(224_20%_82%)]">
          {t.ui.portraitOnlyBody}
        </p>
      </div>
    </div>
  );
};
