import { Globe2, Telescope } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';

export const ViewModeToggle = () => {
  const { t } = useTranslation();
  const viewMode = useStore((s) => s.viewMode);
  const activeBody = useStore((s) => s.activeBody);
  const selectedUniversePreset = useStore((s) => s.selectedUniversePreset);
  const selectedStarWarsBody = useStore((s) => s.selectedStarWarsBody);
  const travelTo = useStore((s) => s.travelTo);
  const travelToStarWars = useStore((s) => s.travelToStarWars);
  const travelToOverview = useStore((s) => s.travelToOverview);

  const onClick = (): void => {
    if (
      viewMode === 'overview' &&
      selectedUniversePreset === 'starWars' &&
      selectedStarWarsBody
    ) {
      travelToStarWars(selectedStarWarsBody);
    } else if (viewMode === 'overview' && activeBody) {
      travelTo(activeBody);
    } else {
      travelToOverview();
    }
  };

  const isOverview = viewMode === 'overview';
  const label = isOverview ? t.ui.closeup : t.ui.overview;
  const Icon = isOverview ? Telescope : Globe2;
  const hasCloseTarget =
    selectedUniversePreset === 'starWars' ? !!selectedStarWarsBody : !!activeBody;
  const disabled = isOverview && !hasCloseTarget;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="pointer-events-auto flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white/90 backdrop-blur-md transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-black/40"
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
};
