/**
 * Runtime graphics tier for scaling particle counts, postprocessing, DPR, etc.
 * Evaluated once per page load (safe for SSR: defaults to `high` until `window` exists).
 */

export type GraphicsTier = 'high' | 'medium' | 'low';

let cachedTier: GraphicsTier | null = null;

const detectTier = (): GraphicsTier => {
  if (typeof window === 'undefined') return 'high';

  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean };
  };
  if (nav.connection?.saveData === true) return 'low';

  const mobileLike =
    window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(max-width: 768px)').matches;

  if (!mobileLike) return 'high';

  const cores = typeof navigator.hardwareConcurrency === 'number'
    ? navigator.hardwareConcurrency
    : 4;
  return cores >= 6 ? 'medium' : 'low';
};

export const getGraphicsTier = (): GraphicsTier => {
  if (cachedTier !== null) return cachedTier;
  cachedTier = detectTier();
  return cachedTier;
};

/** Caps devicePixelRatio for Canvas `dpr` to reduce fill rate on phones/tablets. */
export const getCanvasDprCap = (tier: GraphicsTier): number => {
  if (typeof window === 'undefined') return 2;
  const raw = window.devicePixelRatio || 1;
  if (tier === 'high') return Math.min(raw, 2);
  if (tier === 'medium') return Math.min(raw, 1.5);
  return 1;
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
  readonly effectsMode: 'full' | 'reduced';
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
    effectsMode: 'full',
    effectComposerMsaa: 4,
    antialias: true,
  },
  medium: {
    starsCount: 7000,
    starsRadius: 2200,
    asteroidCount: 1200,
    planetSphere: [48, 36],
    cloudSphere: [32, 24],
    orbitLineSegments: 256,
    milkyWaySphere: [48, 48],
    textureAnisotropy: 4,
    effectsMode: 'reduced',
    effectComposerMsaa: 0,
    antialias: true,
  },
  low: {
    starsCount: 3500,
    starsRadius: 2000,
    asteroidCount: 400,
    planetSphere: [32, 24],
    cloudSphere: [24, 16],
    orbitLineSegments: 128,
    milkyWaySphere: [32, 32],
    textureAnisotropy: 2,
    /** Same Bloom/tone map as desktop; skip only DoF (very heavy on low-end). */
    effectsMode: 'reduced',
    effectComposerMsaa: 0,
    antialias: true,
  },
};

export const getGraphicsPreset = (): GraphicsPreset =>
  GRAPHICS_PRESETS[getGraphicsTier()];
