import { describe, expect, it } from 'vitest';
import { buildSkyFragmentShader } from './milkyWayShaders';

const countOccurrences = (source: string, needle: string): number =>
  source.split(needle).length - 1;

describe('buildSkyFragmentShader', () => {
  it('leaves no placeholder behind in either variant', () => {
    expect(buildSkyFragmentShader(true)).not.toContain('NEBULA_CHUNK');
    expect(buildSkyFragmentShader(false)).not.toContain('NEBULA_CHUNK');
  });

  /**
   * The whole point of the split: each `fbm` call is five octaves of four
   * `sin()` evaluated per fragment across a sphere that fills the screen.
   */
  it('drops three of the eight fbm evaluations when the nebula is off', () => {
    const withNebula = countOccurrences(buildSkyFragmentShader(true), 'fbm(');
    const withoutNebula = countOccurrences(
      buildSkyFragmentShader(false),
      'fbm(',
    );

    // One occurrence is the function definition itself.
    expect(withNebula).toBe(9);
    expect(withoutNebula).toBe(6);
  });

  it('references no nebula symbols once the chunk is dropped', () => {
    const source = buildSkyFragmentShader(false);

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
    const source = buildSkyFragmentShader(true);

    for (const symbol of ['dir', 'latitude', 'bandDistance', 'color']) {
      const declaration = source.indexOf(`${symbol} =`);
      const nebulaUse = source.indexOf('nebulaFieldA');
      expect(declaration).toBeGreaterThan(-1);
      expect(declaration).toBeLessThan(nebulaUse);
    }
  });

  it('still applies the dust lanes after the nebula term', () => {
    const source = buildSkyFragmentShader(true);
    expect(source.indexOf('nebulaColor * (nebulaMask')).toBeLessThan(
      source.indexOf('color *= 1.0 - dustLanes'),
    );
  });
});
