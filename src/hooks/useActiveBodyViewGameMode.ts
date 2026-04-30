import { useStore } from '../store/useStore';

export function useActiveBodyViewGameMode() {
  const activeBody = useStore((s) => s.activeBody);
  const viewMode = useStore((s) => s.viewMode);
  const gameMode = useStore((s) => s.gameMode);
  return { activeBody, viewMode, gameMode };
}
