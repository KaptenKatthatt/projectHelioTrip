import { useTexture } from '@react-three/drei/core/Texture';
import { RING_DEFINITIONS } from './rings';
import { collectOrderedSurfaceTextureUrls } from './textures';

const collectRingTextureUrls = (): readonly string[] => {
  const out: string[] = [];
  for (const def of Object.values(RING_DEFINITIONS)) {
    if (def?.texture) out.push(def.texture);
  }
  return out;
};

const dedupeAppend = (
  primary: readonly string[],
  extra: readonly string[],
): readonly string[] => {
  const seen = new Set<string>(primary);
  const out = [...primary];
  for (const url of extra) {
    if (seen.has(url)) continue;
    seen.add(url);
    out.push(url);
  }
  return out;
};

/**
 * After first paint, queues `useTexture.preload` one URL per idle slice so
 * we do not open ~30 parallel downloads during initial navigation (LCP / SI).
 */
export const scheduleDeferredTexturePreloads = (): void => {
  const urls = dedupeAppend(
    collectOrderedSurfaceTextureUrls(),
    collectRingTextureUrls(),
  );
  let index = 0;

  const schedule = (cb: () => void): void => {
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(
        () => {
          cb();
        },
        { timeout: 2500 },
      );
      return;
    }
    setTimeout(cb, 16);
  };

  const pump = (): void => {
    const url = urls[index];
    if (url === undefined) return;
    useTexture.preload(url);
    index += 1;
    schedule(pump);
  };

  schedule(pump);
};
