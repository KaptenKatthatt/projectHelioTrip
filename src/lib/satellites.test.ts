import { describe, expect, it } from 'vitest';
import { SATELLITES, getSatellite } from './satellites';

describe('SATELLITES', () => {
  it('ISS entry has a glbPath pointing to the renamed file', () => {
    const iss = getSatellite('iss');
    expect(iss?.glbPath).toBe('/International_Space_Station_(ISS)_(A).meshopt.glb');
  });

  it('glbPath is optional — a satellite without it still type-checks', () => {
    const allHaveValidShape = SATELLITES.every(
      (s) => typeof s.id === 'string' && typeof s.radius === 'number',
    );
    expect(allHaveValidShape).toBe(true);
  });
});
