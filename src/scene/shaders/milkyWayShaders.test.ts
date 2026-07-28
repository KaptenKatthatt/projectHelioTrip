import { describe, expect, it } from 'vitest';
import { buildSkyFragmentShader, type SkyShaderOptions } from './milkyWayShaders';
import { QUALITY_LEVELS, QUALITY_PRESETS } from '../../lib/quality/qualityLevels';

const countOccurrences = (source: string, needle: string): number =>
  source.split(needle).length - 1;

/** Exactly what `MilkyWaySphere` passes, so the tests track the real call. */
const optionsForLevel = (level: number): SkyShaderOptions => {
  const quality = QUALITY_PRESETS[level as 0 | 1 | 2 | 3 | 4].milkyWayQuality;
  return {
    withNebula: quality.nebulaOpacity > 0,
    fbmOctaves: quality.skyFbmOctaves,
    dustLanes: quality.skyDustLanes,
    starMist: quality.skyStarMist,
  };
};

const FULL: SkyShaderOptions = {
  withNebula: false,
  fbmOctaves: 5,
  dustLanes: true,
  starMist: true,
};

describe('buildSkyFragmentShader', () => {
  it('leaves no placeholder behind in any variant', () => {
    for (const level of QUALITY_LEVELS) {
      const source = buildSkyFragmentShader(optionsForLevel(level));
      expect(source).not.toContain('CHUNK');
      expect(source).not.toContain('__FBM');
    }
  });

  /**
   * The whole point of the split: each `fbm` call is five octaves of four
   * `sin()` evaluated per fragment across a sphere that fills the screen.
   */
  it('drops three of the eight fbm evaluations when the nebula is off', () => {
    const withNebula = countOccurrences(
      buildSkyFragmentShader({ ...FULL, withNebula: true }),
      'fbm(',
    );
    const withoutNebula = countOccurrences(buildSkyFragmentShader(FULL), 'fbm(');

    // One occurrence is the function definition itself.
    expect(withNebula).toBe(9);
    expect(withoutNebula).toBe(6);
  });

  it('references no nebula symbols once the chunk is dropped', () => {
    const source = buildSkyFragmentShader(FULL);

    for (const symbol of [
      'nebulaFieldA',
      'nebulaFieldB',
      'nebulaMask',
      'nebulaColor',
    ]) {
      expect(source).not.toContain(symbol);
    }
  });

  it('keeps every symbol the nebula chunk depends on defined before use', () => {
    const source = buildSkyFragmentShader({ ...FULL, withNebula: true });

    for (const symbol of ['dir', 'latitude', 'bandDistance', 'color']) {
      const declaration = source.indexOf(`${symbol} =`);
      const nebulaUse = source.indexOf('nebulaFieldA');
      expect(declaration).toBeGreaterThan(-1);
      expect(declaration).toBeLessThan(nebulaUse);
    }
  });

  it('still applies the dust lanes after the nebula term', () => {
    const source = buildSkyFragmentShader({ ...FULL, withNebula: true });
    expect(source.indexOf('nebulaColor * (nebulaMask')).toBeLessThan(
      source.indexOf('color *= 1.0 - dustLanes'),
    );
  });

  /**
   * The promise the ladder is built on. Level 0 must run the shader exactly as
   * authored: five octaves, every noise term, and a normalization factor of
   * exactly one -- which is an exact no-op in IEEE 754, so no pixel moves.
   */
  it('emits the shader as authored at level 0', () => {
    const source = buildSkyFragmentShader(optionsForLevel(0));

    expect(source).toContain('octave < 5');
    expect(source).toContain('return value * 1.00000000');
    expect(source).toContain('float starMist = fbm(');
    expect(source).toContain('float dustNoiseA = fbm(');
    expect(source).toContain('float faintScatter = fbm(');
  });

  it('still declares dustLanes when the term is switched off', () => {
    const source = buildSkyFragmentShader({ ...FULL, dustLanes: false });

    // The consumer below it is unconditional, so the symbol has to survive.
    expect(source).toContain('float dustLanes = 0.0;');
    expect(source).toContain('color *= 1.0 - dustLanes');
    expect(source).not.toContain('dustNoiseA');
  });

  it('replaces the star mist with its own mean rather than zero', () => {
    const source = buildSkyFragmentShader({ ...FULL, starMist: false });

    expect(source).toContain('float starMist = 0.5;');
    expect(source).not.toContain('faintScatter');
  });

  /**
   * Dropping octaves without renormalizing would halve the noise, and every
   * threshold in this shader is tuned against a chain that sums to ~1 -- the
   * band would drift off centre rather than merely get cheaper.
   */
  it('renormalizes a shortened fbm chain back into range', () => {
    const oneOctave = buildSkyFragmentShader({ ...FULL, fbmOctaves: 1 });
    const factor = Number(
      /return value \* ([0-9.]+)/.exec(oneOctave)?.[1] ?? 'NaN',
    );

    // A single octave has amplitude 0.5 against the reference sum of ~1.002.
    expect(factor).toBeCloseTo(2.004, 3);
  });

  it('gets steadily cheaper down the ladder and never more expensive', () => {
    const noiseCalls = QUALITY_LEVELS.map(
      (level) =>
        countOccurrences(buildSkyFragmentShader(optionsForLevel(level)), 'fbm(') *
        QUALITY_PRESETS[level].milkyWayQuality.skyFbmOctaves,
    );

    for (let i = 1; i < noiseCalls.length; i += 1) {
      expect(noiseCalls[i]).toBeLessThanOrEqual(noiseCalls[i - 1] ?? Infinity);
    }
    // The bottom rung must be dramatically cheaper, not marginally so.
    expect(noiseCalls.at(-1)).toBeLessThan((noiseCalls[0] ?? 0) / 8);
  });

  it('never emits a zero-iteration loop, whatever it is handed', () => {
    expect(buildSkyFragmentShader({ ...FULL, fbmOctaves: 0 })).toContain(
      'octave < 1',
    );
  });
});
