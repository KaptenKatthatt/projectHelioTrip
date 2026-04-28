import { useStore } from "../store/useStore";
import { useTimePlaybackDisabled } from "./useTimePlaybackDisabled";

export const useTimePlaybackState = () => {
  const isPlaying = useStore((s) => s.isPlaying);
  const togglePlay = useStore((s) => s.togglePlay);
  const timeScale = useStore((s) => s.timeScale);
  const timePlaybackDisabled = useTimePlaybackDisabled();

  return {
    isPlaying,
    togglePlay,
    timeScale,
    timePlaybackDisabled,
  };
};
