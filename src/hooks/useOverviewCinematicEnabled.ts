import { useStore } from '../store/useStore';

export const useOverviewCinematicEnabled = (): boolean => {
  const viewMode = useStore((s) => s.viewMode);
  const navigationMode = useStore((s) => s.navigationMode);
  const isTraveling = useStore((s) => s.isTraveling);

  return viewMode === 'overview' && navigationMode === 'cinematic' && !isTraveling;
};
