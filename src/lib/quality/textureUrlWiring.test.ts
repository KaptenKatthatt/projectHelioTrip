import { describe, expect, it } from 'vitest';

/**
 * Every texture URL must pass through `textureUrl` before it reaches a
 * loader, or that texture silently loads full-size on every rung. Nothing
 * else fails when a call site forgets: the file exists, the scene renders,
 * and the ladder just quietly does not apply. This sweep is what fails
 * instead. It looks at raw source text because the mistake is textual — a
 * string literal handed straight to `useTexture`.
 */
const MODULES = import.meta.glob('../../**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/**
 * Files allowed to hold bare `/textures/` literals: the URL table itself
 * (every entry flows through its `base()` wrapper), and the generated
 * manifest, which is data about URLs rather than a load of one.
 */
const ALLOWLIST = [/\/textures\.ts$/, /textureVariants\.generated\.ts$/];

describe('texture URLs are ladder-aware', () => {
  it('wraps every /textures/ literal outside the URL table in textureUrl()', () => {
    const offenders: string[] = [];

    for (const [path, source] of Object.entries(MODULES)) {
      if (path.includes('.test.')) continue;
      if (ALLOWLIST.some((pattern) => pattern.test(path))) continue;

      for (const [index, line] of source.split('\n').entries()) {
        if (!/['"`]\/textures\//.test(line)) continue;
        if (line.includes('textureUrl(')) continue;
        offenders.push(`${path}:${index + 1}  ${line.trim()}`);
      }
    }

    expect(offenders, offenders.join('\n')).toEqual([]);
  });

  // The sweep is text, so prove it sees enough text to mean anything.
  it('actually scans the known call sites', () => {
    const paths = Object.keys(MODULES);
    expect(paths.some((p) => p.endsWith('MarsSurface.tsx'))).toBe(true);
    expect(paths.some((p) => p.endsWith('EarthSphere.tsx'))).toBe(true);
    expect(paths.some((p) => p.endsWith('rings.ts'))).toBe(true);
  });
});
