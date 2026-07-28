import { describe, expect, it } from 'vitest';
import {
  QUALITY_LEVELS,
  QUALITY_PRESETS,
  clampQualityLevel,
  isGraphicsQualityPreference,
  isQualityLevel,
  type QualityLevel,
} from './qualityLevels';

/**
 * Frozen copies of the three presets that existed before the ladder, taken
 * from `graphicsTier.ts` as it stood at the previous commit. These are the
 * contract: whatever else the ladder grows, the rungs people already see must
 * keep rendering exactly what they rendered before.
 */
const LEGACY_HIGH = {
  starsCount: 12_000,
  starsRadius: 2500,
  asteroidCount: 2200,
  planetSphere: [64, 48],
  cloudSphere: [48, 32],
  orbitLineSegments: 512,
  milkyWaySphere: [96, 72],
  textureAnisotropy: 8,
  effectComposerMsaa: 4,
  antialias: true,
  dprCap: 2,
  milkyWayQuality: {
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
  },
} as const;

const LEGACY_MEDIUM = {
  starsCount: 7000,
  starsRadius: 2200,
  asteroidCount: 900,
  planetSphere: [40, 30],
  cloudSphere: [32, 24],
  orbitLineSegments: 320,
  milkyWaySphere: [72, 56],
  textureAnisotropy: 4,
  effectComposerMsaa: 0,
  antialias: true,
  dprCap: 1.25,
  milkyWayQuality: {
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
  },
} as const;

const LEGACY_LOW = {
  starsCount: 2400,
  starsRadius: 1800,
  asteroidCount: 220,
  planetSphere: [28, 20],
  cloudSphere: [20, 14],
  orbitLineSegments: 256,
  milkyWaySphere: [24, 24],
  textureAnisotropy: 1,
  effectComposerMsaa: 0,
  antialias: false,
  dprCap: 0.9,
  milkyWayQuality: {
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
  },
} as const;

/** Widened: the three literals each have their own literal types. */
type LegacyPreset = {
  readonly [K in Exclude<keyof typeof LEGACY_HIGH, 'milkyWayQuality'>]: unknown;
} & {
  readonly milkyWayQuality: Readonly<Record<string, unknown>>;
};

const expectMatchesLegacy = (level: QualityLevel, legacy: LegacyPreset): void => {
  const preset = QUALITY_PRESETS[level];
  const { milkyWayQuality: legacyMilkyWay, ...legacyScalars } = legacy;

  for (const [field, value] of Object.entries(legacyScalars)) {
    expect(preset[field as keyof typeof preset], `${field} on level ${level}`).toEqual(value);
  }
  for (const [field, value] of Object.entries(legacyMilkyWay)) {
    expect(
      preset.milkyWayQuality[field as keyof typeof preset.milkyWayQuality],
      `milkyWayQuality.${field} on level ${level}`,
    ).toEqual(value);
  }
};

describe('QUALITY_PRESETS', () => {
  it('keeps level 0 identical to the old high preset', () => {
    expectMatchesLegacy(0, LEGACY_HIGH);
  });

  it('keeps level 2 identical to the old medium preset', () => {
    expectMatchesLegacy(2, LEGACY_MEDIUM);
  });

  it('keeps level 3 identical to the old low preset', () => {
    expectMatchesLegacy(3, LEGACY_LOW);
  });

  it('keeps depth of field only where the old preset ran the full effect chain', () => {
    expect(QUALITY_PRESETS[0].depthOfField).toBe(true);
    expect(QUALITY_PRESETS[2].depthOfField).toBe(false);
    expect(QUALITY_PRESETS[3].depthOfField).toBe(false);
  });

  /** One loop rather than sixty assertions, and it catches every typo. */
  it('never gets more expensive as the level goes up', () => {
    const scalarFields = [
      'starsCount',
      'starsRadius',
      'asteroidCount',
      'orbitLineSegments',
      'textureAnisotropy',
      'effectComposerMsaa',
      'ringDebrisScale',
      'dprCap',
      'surfaceShadowMapSize',
    ] as const;
    const pairFields = [
      'planetSphere',
      'cloudSphere',
      'sunSphere',
      'ringSegments',
      'milkyWaySphere',
    ] as const;
    const milkyWayFields = [
      'overlayStarCount',
      'overlayMicroStarCount',
      'bandIntensity',
      'dustLaneOpacity',
      'nebulaParticleCount',
      'nebulaClusterCount',
      'skyFbmOctaves',
    ] as const;
    const extraScalarFields = ['ringDebrisScale', 'surfaceShadowMapSize'] as const;

    for (let level = 0; level < QUALITY_LEVELS.length - 1; level++) {
      const better = QUALITY_PRESETS[level as QualityLevel];
      const worse = QUALITY_PRESETS[(level + 1) as QualityLevel];

      for (const field of extraScalarFields) {
        expect(better[field], `${field} between level ${level} and ${level + 1}`).toBeGreaterThanOrEqual(
          worse[field],
        );
      }
      for (const field of scalarFields) {
        expect(better[field], `${field} between level ${level} and ${level + 1}`).toBeGreaterThanOrEqual(
          worse[field],
        );
      }
      for (const field of pairFields) {
        expect(better[field][0], `${field}[0] at level ${level}`).toBeGreaterThanOrEqual(
          worse[field][0],
        );
        expect(better[field][1], `${field}[1] at level ${level}`).toBeGreaterThanOrEqual(
          worse[field][1],
        );
      }
      for (const field of milkyWayFields) {
        expect(
          better.milkyWayQuality[field],
          `milkyWayQuality.${field} at level ${level}`,
        ).toBeGreaterThanOrEqual(worse.milkyWayQuality[field]);
      }
    }
  });

  it('never turns an effect back on at a worse level', () => {
    const flags = ['postProcessingEnabled', 'bloom', 'depthOfField', 'antialias', 'cloudsEnabled'] as const;
    const milkyWayFlags = ['skyDustLanes', 'skyStarMist'] as const;
    for (let level = 0; level < QUALITY_LEVELS.length - 1; level++) {
      const better = QUALITY_PRESETS[level as QualityLevel];
      const worse = QUALITY_PRESETS[(level + 1) as QualityLevel];
      for (const flag of flags) {
        if (!better[flag]) {
          expect(worse[flag], `${flag} at level ${level + 1}`).toBe(false);
        }
      }
      for (const flag of milkyWayFlags) {
        if (!better.milkyWayQuality[flag]) {
          expect(
            worse.milkyWayQuality[flag],
            `milkyWayQuality.${flag} at level ${level + 1}`,
          ).toBe(false);
        }
      }
    }
  });
});

describe('quality level guards', () => {
  it('accepts every real level and nothing else', () => {
    for (const level of QUALITY_LEVELS) expect(isQualityLevel(level)).toBe(true);
    for (const value of [5, -1, '0', 1.5, null, undefined, {}, 'auto']) {
      expect(isQualityLevel(value)).toBe(false);
    }
  });

  it('accepts auto alongside the levels as a preference', () => {
    expect(isGraphicsQualityPreference('auto')).toBe(true);
    expect(isGraphicsQualityPreference(3)).toBe(true);
    for (const value of ['high', 5, -1, null, undefined]) {
      expect(isGraphicsQualityPreference(value)).toBe(false);
    }
  });

  it('clamps out-of-range levels rather than trusting them', () => {
    expect(clampQualityLevel(-3)).toBe(0);
    expect(clampQualityLevel(99)).toBe(4);
    expect(clampQualityLevel(2.4)).toBe(2);
  });
});
