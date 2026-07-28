import { describe, expect, it } from 'vitest';
import { QUALITY_PRESETS } from './qualityLevels';

/**
 * Guards against the ladder promising something it does not deliver.
 *
 * Every rung of this table is a claim: that turning it down makes the app
 * cheaper. The monotonicity test checks the numbers descend, which reads as
 * confirmation that they do something — but a field nothing consumes descends
 * just as neatly as one that does, and six of them were exactly that. A weak
 * machine dropped to the bottom rung and still drew full-resolution shadow
 * maps and the full-octave sky, in the surface scenes the feature exists for.
 *
 * Static, not behavioural: it cannot prove a field is used *correctly*, only
 * that dropping one in without wiring it up fails the build instead of
 * silently becoming decoration.
 */

/** Vite resolves this at transform time, so no node typings are needed. */
const MODULES = import.meta.glob('../../**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const readAllSources = (): string => {
  const entries = Object.entries(MODULES).filter(
    ([path]) => !path.includes('.test.') && !path.endsWith('qualityLevels.ts'),
  );
  // Sanity: an empty or tiny corpus would make every assertion below vacuous.
  expect(entries.length).toBeGreaterThan(50);
  return entries.map(([, source]) => source).join('\n');
};

const presetFields = Object.keys(QUALITY_PRESETS[0]).filter(
  (field) => field !== 'milkyWayQuality',
);
const milkyWayFields = Object.keys(QUALITY_PRESETS[0].milkyWayQuality);

describe('every quality preset field is consumed somewhere', () => {
  const sources = readAllSources();

  it.each(presetFields)('reads %s', (field) => {
    expect(sources).toContain(field);
  });

  it.each(milkyWayFields)('reads milkyWayQuality.%s', (field) => {
    expect(sources).toContain(field);
  });
});
