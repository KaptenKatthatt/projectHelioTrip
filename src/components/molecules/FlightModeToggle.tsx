import { Navigation, Rocket } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";
import { useStore } from "../../store/useStore";

export const FlightModeToggle = () => {
  const { t } = useTranslation();
  const navigationMode = useStore((s) => s.navigationMode);
  const setNavigationMode = useStore((s) => s.setNavigationMode);
  const selectedConstellation = useStore((s) => s.selectedConstellation);

  const isFree = navigationMode === "free";
  const Icon = isFree ? Navigation : Rocket;
  const label = isFree ? t.ui.autopilot : t.ui.freeFlight;
  const disabled = selectedConstellation !== null;

  const onClick = (): void => {
    setNavigationMode(isFree ? "cinematic" : "free");
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={disabled ? "Free flight is unavailable while viewing a constellation" : undefined}
      className="pointer-events-auto flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white/90 backdrop-blur-md transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-black/40"
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
};
