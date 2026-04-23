import { Navigation, Rocket } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';

export const FlightModeToggle = () => {
  const { t } = useTranslation();
  const navigationMode = useStore((s) => s.navigationMode);
  const setNavigationMode = useStore((s) => s.setNavigationMode);

  const isFree = navigationMode === 'free';
  const Icon = isFree ? Navigation : Rocket;
  const label = isFree ? t.ui.autopilot : t.ui.freeFlight;

  const onClick = (): void => {
    setNavigationMode(isFree ? 'cinematic' : 'free');
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="pointer-events-auto flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white/90 backdrop-blur-md transition hover:bg-white/10"
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
};
