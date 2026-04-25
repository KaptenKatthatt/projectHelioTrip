import { useTexture } from "@react-three/drei/core/Texture";
import { getGraphicsTier, type GraphicsTier } from "./graphicsTier";
import { RING_DEFINITIONS } from "./rings";
import { collectOrderedSurfaceTextureUrls } from "./textures";

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

const DATA_MAP_PATTERN = /\/(normal|roughness)\.webp$/i;

const shouldPreloadUrlForTier = (url: string, tier: GraphicsTier): boolean => {
  if (!DATA_MAP_PATTERN.test(url)) return true;
  if (tier === "high") return true;
  if (tier === "medium") return !url.includes("/roughness.webp");
  return false;
};

const preloadBatchSize = (tier: GraphicsTier): number => {
  if (tier === "high") return 6;
  if (tier === "medium") return 4;
  return 2;
};

/**
 * After first paint, queues `useTexture.preload` one URL per idle slice so
 * we do not open ~30 parallel downloads during initial navigation (LCP / SI).
 */
export const scheduleDeferredTexturePreloads = (): void => {
  const tier = getGraphicsTier();
  const urls = dedupeAppend(
    collectOrderedSurfaceTextureUrls().filter((url) =>
      shouldPreloadUrlForTier(url, tier),
    ),
    collectRingTextureUrls().filter((url) =>
      shouldPreloadUrlForTier(url, tier),
    ),
  );
  const batchSize = preloadBatchSize(tier);
  let index = 0;

  const schedule = (cb: () => void): void => {
    if (typeof requestIdleCallback !== "undefined") {
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
    if (index >= urls.length) return;
    for (let i = 0; i < batchSize; i += 1) {
      const url = urls[index];
      if (url === undefined) break;
      useTexture.preload(url);
      index += 1;
    }
    schedule(pump);
  };

  schedule(pump);
};
