/**
 * Runtime graphics tier for scaling particle counts, postprocessing, DPR, etc.
 * Evaluated once per page load (safe for SSR: defaults to `high` until `window` exists).
 */

export type GraphicsTier = "high" | "medium" | "low";

export type RuntimeDeviceBucket =
  | "desktop"
  | "mobile-high"
  | "mobile-medium"
  | "mobile-low";

let cachedTier: GraphicsTier | null = null;
let cachedBucket: RuntimeDeviceBucket | null = null;

const detectRuntimeDeviceBucket = (): RuntimeDeviceBucket => {
  if (typeof window === "undefined") return "desktop";

  const mobileLike =
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(max-width: 768px)").matches;

  if (!mobileLike) return "desktop";

  const cores =
    typeof navigator.hardwareConcurrency === "number"
      ? navigator.hardwareConcurrency
      : 4;
  const nav = navigator as Navigator & {
    deviceMemory?: number;
  };
  const memory = typeof nav.deviceMemory === "number" ? nav.deviceMemory : 4;

  if (cores >= 8 && memory >= 6) return "mobile-high";
  if (cores >= 6 && memory >= 4) return "mobile-medium";
  return "mobile-low";
};

const detectTier = (): GraphicsTier => {
  if (typeof window === "undefined") return "high";

  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean };
  };
  if (nav.connection?.saveData === true) return "low";

  const bucket = getRuntimeDeviceBucket();
  if (bucket === "desktop") return "high";
  if (bucket === "mobile-high") return "medium";
  return "low";
};

export const getRuntimeDeviceBucket = (): RuntimeDeviceBucket => {
  if (cachedBucket !== null) return cachedBucket;
  cachedBucket = detectRuntimeDeviceBucket();
  return cachedBucket;
};

export const getGraphicsTier = (): GraphicsTier => {
  if (cachedTier !== null) return cachedTier;
  cachedTier = detectTier();
  return cachedTier;
};

/** Caps devicePixelRatio for Canvas `dpr` to reduce fill rate on phones/tablets. */
export const getCanvasDprCap = (tier: GraphicsTier): number => {
  if (typeof window === "undefined") return 2;
  const raw = window.devicePixelRatio || 1;
  if (tier === "high") return Math.min(raw, 2);
  if (tier === "medium") return Math.min(raw, 1.25);
  return Math.min(raw, 0.9);
};

type SphereSegments = readonly [number, number];

export type GraphicsPreset = {
  readonly starsCount: number;
  readonly starsRadius: number;
  readonly asteroidCount: number;
  readonly planetSphere: SphereSegments;
  readonly cloudSphere: SphereSegments;
  readonly orbitLineSegments: number;
  readonly milkyWaySphere: readonly [number, number];
  readonly textureAnisotropy: number;
  readonly effectsMode: "full" | "reduced";
  readonly effectComposerMsaa: number;
  readonly antialias: boolean;
};

export const GRAPHICS_PRESETS: Record<GraphicsTier, GraphicsPreset> = {
  high: {
    starsCount: 12_000,
    starsRadius: 2500,
    asteroidCount: 3000,
    planetSphere: [64, 48],
    cloudSphere: [48, 32],
    orbitLineSegments: 512,
    milkyWaySphere: [64, 64],
    textureAnisotropy: 8,
    effectsMode: "full",
    effectComposerMsaa: 4,
    antialias: true,
  },
  medium: {
    starsCount: 7000,
    starsRadius: 2200,
    asteroidCount: 900,
    planetSphere: [40, 30],
    cloudSphere: [32, 24],
    orbitLineSegments: 256,
    milkyWaySphere: [48, 48],
    textureAnisotropy: 4,
    effectsMode: "reduced",
    effectComposerMsaa: 0,
    antialias: true,
  },
  low: {
    starsCount: 2400,
    starsRadius: 1800,
    asteroidCount: 220,
    planetSphere: [28, 20],
    cloudSphere: [20, 14],
    orbitLineSegments: 128,
    milkyWaySphere: [24, 24],
    textureAnisotropy: 1,
    /** Same Bloom/tone map as desktop; skip only DoF (very heavy on low-end). */
    effectsMode: "reduced",
    effectComposerMsaa: 0,
    antialias: false,
  },
};

export const getGraphicsPreset = (): GraphicsPreset =>
  GRAPHICS_PRESETS[getGraphicsTier()];
