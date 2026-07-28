/**
 * The quality ladder: five discrete levels, 0 being the best.
 *
 * Level 0 is byte-identical to the old `high` preset, level 2 to `medium` and
 * level 3 to `low`, so nothing that looked right before this file existed can
 * look different now. `qualityLevels.test.ts` pins that with a frozen copy of
 * each — any future edit to those three rungs fails the build rather than
 * quietly changing what people see.
 *
 * Levels 1 and 4 are new: one step between the old high and medium, and a
 * floor below the old low for hardware that cannot hold a frame at any of the
 * others.
 *
 * Pure data, no `window` access, so the whole table is testable in vitest's
 * default node environment.
 */

export type QualityLevel = 0 | 1 | 2 | 3 | 4;

export const QUALITY_LEVELS: readonly QualityLevel[] = [0, 1, 2, 3, 4];

export const MIN_QUALITY_LEVEL: QualityLevel = 0;
export const MAX_QUALITY_LEVEL: QualityLevel = 4;

/** What the user can pick. `auto` hands control to the adaptive controller. */
export type GraphicsQualityPreference = 'auto' | QualityLevel;

export const isQualityLevel = (value: unknown): value is QualityLevel =>
  value === 0 || value === 1 || value === 2 || value === 3 || value === 4;

export const isGraphicsQualityPreference = (
  value: unknown,
): value is GraphicsQualityPreference => value === 'auto' || isQualityLevel(value);

export const clampQualityLevel = (value: number): QualityLevel =>
  Math.min(MAX_QUALITY_LEVEL, Math.max(MIN_QUALITY_LEVEL, Math.round(value))) as QualityLevel;

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
  /**
   * Octaves per fbm chain in the sky shader, and whether the dust-lane and
   * star-mist noise runs at all. Measured: dropping every noise term changes
   * no pixel by more than 2 of 255, because the band peaks around 2/255 in the
   * final image — but the structure is authored, so it stays on at level 0 and
   * is traded away only where frames are actually being missed.
   */
  readonly skyFbmOctaves: number;
  readonly skyDustLanes: boolean;
  readonly skyStarMist: boolean;
};

export type QualityPreset = {
  readonly starsCount: number;
  readonly starsRadius: number;
  readonly asteroidCount: number;
  readonly planetSphere: SphereSegments;
  readonly cloudSphere: SphereSegments;
  readonly cloudsEnabled: boolean;
  readonly sunSphere: SphereSegments;
  readonly orbitLineSegments: number;
  readonly ringSegments: SphereSegments;
  readonly ringDebrisScale: number;
  readonly milkyWaySphere: SphereSegments;
  readonly milkyWayQuality: MilkyWayQualityPreset;
  readonly textureAnisotropy: number;
  readonly postProcessingEnabled: boolean;
  readonly bloom: boolean;
  readonly depthOfField: boolean;
  readonly effectComposerMsaa: number;
  /** Context-creation attribute — frozen at boot, never changed at runtime. */
  readonly antialias: boolean;
  readonly dprCap: number;
  readonly surfaceShadowMapSize: number;
};

const MILKY_WAY_BY_LEVEL: Record<QualityLevel, MilkyWayQualityPreset> = {
  0: {
    overlayStarCount: 8000,
    overlayStarSize: 1.08,
    overlayStarOpacity: 0.42,
    overlayMicroStarCount: 7600,
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
    skyFbmOctaves: 5,
    skyDustLanes: true,
    skyStarMist: true,
  },
  1: {
    overlayStarCount: 6500,
    overlayStarSize: 1.05,
    overlayStarOpacity: 0.4,
    overlayMicroStarCount: 6200,
    overlayMicroStarSize: 0.41,
    overlayMicroStarOpacity: 0.1,
    bandIntensity: 0.29,
    dustLaneOpacity: 0.68,
    nebulaParticleCount: 700,
    nebulaClusterCount: 4,
    nebulaParticleSize: 20,
    nebulaOpacity: 0,
    deepSkyObjectOpacity: 0,
    deepSkyObjectSizeScale: 0.95,
    skyFbmOctaves: 4,
    skyDustLanes: true,
    skyStarMist: true,
  },
  2: {
    overlayStarCount: 5000,
    overlayStarSize: 1.02,
    overlayStarOpacity: 0.38,
    overlayMicroStarCount: 4800,
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
    skyFbmOctaves: 3,
    skyDustLanes: true,
    skyStarMist: true,
  },
  3: {
    overlayStarCount: 2700,
    overlayStarSize: 0.96,
    overlayStarOpacity: 0.3,
    overlayMicroStarCount: 2600,
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
    skyFbmOctaves: 2,
    skyDustLanes: true,
    skyStarMist: false,
  },
  4: {
    overlayStarCount: 900,
    overlayStarSize: 0.92,
    overlayStarOpacity: 0.28,
    overlayMicroStarCount: 0,
    overlayMicroStarSize: 0.34,
    overlayMicroStarOpacity: 0.07,
    bandIntensity: 0.16,
    dustLaneOpacity: 0.5,
    nebulaParticleCount: 0,
    nebulaClusterCount: 0,
    nebulaParticleSize: 12,
    nebulaOpacity: 0,
    deepSkyObjectOpacity: 0,
    deepSkyObjectSizeScale: 0.75,
    skyFbmOctaves: 1,
    skyDustLanes: false,
    skyStarMist: false,
  },
};

export const QUALITY_PRESETS: Record<QualityLevel, QualityPreset> = {
  0: {
    starsCount: 12_000,
    starsRadius: 2500,
    asteroidCount: 2200,
    planetSphere: [64, 48],
    cloudSphere: [48, 32],
    cloudsEnabled: true,
    sunSphere: [64, 48],
    orbitLineSegments: 512,
    ringSegments: [96, 128],
    ringDebrisScale: 1,
    milkyWaySphere: [96, 72],
    milkyWayQuality: MILKY_WAY_BY_LEVEL[0],
    textureAnisotropy: 8,
    postProcessingEnabled: true,
    bloom: true,
    depthOfField: true,
    effectComposerMsaa: 4,
    antialias: true,
    dprCap: 2,
    surfaceShadowMapSize: 1024,
  },
  1: {
    starsCount: 9500,
    starsRadius: 2400,
    asteroidCount: 1500,
    planetSphere: [52, 40],
    cloudSphere: [40, 28],
    cloudsEnabled: true,
    sunSphere: [64, 48],
    orbitLineSegments: 400,
    ringSegments: [72, 96],
    ringDebrisScale: 0.7,
    milkyWaySphere: [84, 64],
    milkyWayQuality: MILKY_WAY_BY_LEVEL[1],
    textureAnisotropy: 8,
    postProcessingEnabled: true,
    bloom: true,
    depthOfField: true,
    effectComposerMsaa: 2,
    antialias: true,
    dprCap: 1.5,
    surfaceShadowMapSize: 1024,
  },
  2: {
    starsCount: 7000,
    starsRadius: 2200,
    asteroidCount: 900,
    planetSphere: [40, 30],
    cloudSphere: [32, 24],
    cloudsEnabled: true,
    sunSphere: [48, 32],
    orbitLineSegments: 320,
    ringSegments: [48, 64],
    ringDebrisScale: 0.45,
    milkyWaySphere: [72, 56],
    milkyWayQuality: MILKY_WAY_BY_LEVEL[2],
    textureAnisotropy: 4,
    postProcessingEnabled: true,
    bloom: true,
    depthOfField: false,
    effectComposerMsaa: 0,
    antialias: true,
    dprCap: 1.25,
    surfaceShadowMapSize: 512,
  },
  3: {
    starsCount: 2400,
    starsRadius: 1800,
    asteroidCount: 220,
    planetSphere: [28, 20],
    cloudSphere: [20, 14],
    cloudsEnabled: true,
    sunSphere: [32, 24],
    orbitLineSegments: 256,
    ringSegments: [32, 32],
    ringDebrisScale: 0.25,
    milkyWaySphere: [24, 24],
    milkyWayQuality: MILKY_WAY_BY_LEVEL[3],
    textureAnisotropy: 1,
    postProcessingEnabled: true,
    bloom: true,
    depthOfField: false,
    effectComposerMsaa: 0,
    antialias: false,
    dprCap: 0.9,
    surfaceShadowMapSize: 0,
  },
  4: {
    starsCount: 1200,
    starsRadius: 1500,
    asteroidCount: 0,
    planetSphere: [20, 14],
    cloudSphere: [16, 12],
    cloudsEnabled: false,
    sunSphere: [24, 16],
    orbitLineSegments: 160,
    ringSegments: [24, 16],
    ringDebrisScale: 0,
    milkyWaySphere: [16, 16],
    milkyWayQuality: MILKY_WAY_BY_LEVEL[4],
    textureAnisotropy: 1,
    postProcessingEnabled: false,
    bloom: false,
    depthOfField: false,
    effectComposerMsaa: 0,
    antialias: false,
    dprCap: 0.65,
    surfaceShadowMapSize: 0,
  },
};
