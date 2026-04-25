/**
 * Runtime graphics tier for scaling particle counts, postprocessing, DPR, etc.
 * Evaluated once per page load (safe for SSR: defaults to `high` until `window` exists).
 */

export type GraphicsTier = "high" | "medium" | "low";

let cachedTier: GraphicsTier | null = null;

const detectTier = (): GraphicsTier => {
  if (typeof window === "undefined") return "high";

  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean };
  };
  if (nav.connection?.saveData === true) return "low";

  const mobileLike =
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(max-width: 768px)").matches;

  if (!mobileLike) return "high";

  const cores =
    typeof navigator.hardwareConcurrency === "number"
      ? navigator.hardwareConcurrency
      : 4;
  return cores >= 6 ? "medium" : "low";
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
  if (tier === "medium") return Math.min(raw, 1.5);
  return 1;
};

type SphereSegments = readonly [number, number];

export type MilkyWayQualityPreset = {
  readonly overlayStarCount: number;
  readonly overlayStarSize: number;
  readonly overlayStarOpacity: number;
  readonly overlayMicroStarCount: number;
  readonly overlayMicroStarSize: number;
  readonly overlayMicroStarOpacity: number;
  readonly bandIntensity: number;
  readonly dustLaneOpacity: number;
  readonly nebulaParticleCount: number;
  readonly nebulaClusterCount: number;
  readonly nebulaParticleSize: number;
  readonly nebulaOpacity: number;
  readonly deepSkyObjectOpacity: number;
  readonly deepSkyObjectSizeScale: number;
};

export type GraphicsPreset = {
  readonly starsCount: number;
  readonly starsRadius: number;
  readonly asteroidCount: number;
  readonly planetSphere: SphereSegments;
  readonly cloudSphere: SphereSegments;
  readonly orbitLineSegments: number;
  readonly milkyWaySphere: readonly [number, number];
  readonly milkyWayQuality: MilkyWayQualityPreset;
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
    milkyWaySphere: [96, 72],
    milkyWayQuality: {
      overlayStarCount: 7600,
      overlayStarSize: 1.08,
      overlayStarOpacity: 0.42,
      overlayMicroStarCount: 6800,
      overlayMicroStarSize: 0.42,
      overlayMicroStarOpacity: 0.11,
      bandIntensity: 0.32,
      dustLaneOpacity: 0.72,
      nebulaParticleCount: 900,
      nebulaClusterCount: 5,
      nebulaParticleSize: 22,
      nebulaOpacity: 0,
      deepSkyObjectOpacity: 0,
      deepSkyObjectSizeScale: 1,
    },
    textureAnisotropy: 8,
    effectsMode: "full",
    effectComposerMsaa: 4,
    antialias: true,
  },
  medium: {
    starsCount: 7000,
    starsRadius: 2200,
    asteroidCount: 1200,
    planetSphere: [48, 36],
    cloudSphere: [32, 24],
    orbitLineSegments: 320,
    milkyWaySphere: [72, 56],
    milkyWayQuality: {
      overlayStarCount: 4600,
      overlayStarSize: 1.02,
      overlayStarOpacity: 0.38,
      overlayMicroStarCount: 4200,
      overlayMicroStarSize: 0.4,
      overlayMicroStarOpacity: 0.095,
      bandIntensity: 0.26,
      dustLaneOpacity: 0.64,
      nebulaParticleCount: 520,
      nebulaClusterCount: 4,
      nebulaParticleSize: 18,
      nebulaOpacity: 0,
      deepSkyObjectOpacity: 0,
      deepSkyObjectSizeScale: 0.9,
    },
    textureAnisotropy: 4,
    effectsMode: "reduced",
    effectComposerMsaa: 2,
    antialias: true,
  },
  low: {
    starsCount: 3500,
    starsRadius: 2000,
    asteroidCount: 400,
    planetSphere: [32, 24],
    cloudSphere: [24, 16],
    orbitLineSegments: 256,
    milkyWaySphere: [48, 36],
    milkyWayQuality: {
      overlayStarCount: 2400,
      overlayStarSize: 0.96,
      overlayStarOpacity: 0.3,
      overlayMicroStarCount: 2200,
      overlayMicroStarSize: 0.36,
      overlayMicroStarOpacity: 0.082,
      bandIntensity: 0.2,
      dustLaneOpacity: 0.56,
      nebulaParticleCount: 220,
      nebulaClusterCount: 3,
      nebulaParticleSize: 14,
      nebulaOpacity: 0,
      deepSkyObjectOpacity: 0,
      deepSkyObjectSizeScale: 0.82,
    },
    textureAnisotropy: 2,
    /** Same Bloom/tone map as desktop; skip only DoF (very heavy on low-end). */
    effectsMode: "reduced",
    effectComposerMsaa: 2,
    antialias: true,
  },
};

export const getGraphicsPreset = (): GraphicsPreset =>
  GRAPHICS_PRESETS[getGraphicsTier()];
