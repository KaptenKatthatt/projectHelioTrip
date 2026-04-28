import { useStore } from '../store/useStore';

export const useTimePlaybackDisabled = (): boolean => {
  const selectedConstellation = useStore((s) => s.selectedConstellation);
  return selectedConstellation !== null;
};
