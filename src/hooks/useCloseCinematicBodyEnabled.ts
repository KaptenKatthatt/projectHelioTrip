import { useStore } from '../store/useStore';

export const useCloseCinematicBodyEnabled = (hasActiveBody: boolean): boolean => {
  const isTraveling = useStore((s) => s.isTraveling);
  const viewMode = useStore((s) => s.viewMode);
  const navigationMode = useStore((s) => s.navigationMode);

  return (
    hasActiveBody &&
    !isTraveling &&
    viewMode === 'close' &&
    navigationMode === 'cinematic'
  );
};
