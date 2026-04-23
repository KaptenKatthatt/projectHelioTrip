import { writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Vector3 } from 'three';
import {
  fetchHorizonsVectors,
  type HorizonsVectorResult,
} from '../api/_lib/horizons';
import {
  HORIZONS_COMMAND_IDS,
  MOON_META,
  MOON_IDS,
  PLANET_IDS,
  type MoonId,
  type PlanetId,
} from '../api/_lib/planets';
import { stateToElements, type OrbitalElements } from '../src/lib/kepler';

const EPOCH = new Date('2026-01-01T00:00:00Z');

const MU_SUN = 2.9591220828559e-4;

const MU_PARENT: Partial<Record<PlanetId, number>> = {
  earth: 8.887692593e-10,
  mars: 9.549495e-11,
  jupiter: 2.82537e-7,
  saturn: 8.4596e-8,
  uranus: 1.2921e-8,
  neptune: 1.5249e-8,
};

const HELIOCENTRIC_CENTER = '500@10';

/**
 * NASA ecliptic-J2000 uses (x, y) in the ecliptic plane with +z to the
 * ecliptic north pole. State vectors come out in that frame, so elements
 * derived from them live in the same frame. Propagation flips the frame
 * to three.js' Y-up at the end, not here.
 */
const toVec3 = (v: HorizonsVectorResult['position']): Vector3 =>
  new Vector3(v.x, v.y, v.z);

const fetchElements = async (
  commandId: number,
  mu: number,
  center = HELIOCENTRIC_CENTER,
): Promise<OrbitalElements> => {
  const state = await fetchHorizonsVectors({
    commandId,
    date: EPOCH,
    center,
  });
  const r = toVec3(state.position);
  const v = toVec3(state.velocity);
  return stateToElements(r, v, mu, EPOCH.getTime());
};

const formatNumber = (value: number): string => {
  if (!Number.isFinite(value)) {
    throw new Error(`Non-finite value: ${String(value)}`);
  }
  if (value === 0) return '0';
  return value.toPrecision(15);
};

const formatElements = (el: OrbitalElements, indent: string): string => {
  const lines = [
    `${indent}  a: ${formatNumber(el.a)},`,
    `${indent}  e: ${formatNumber(el.e)},`,
    `${indent}  iRad: ${formatNumber(el.iRad)},`,
    `${indent}  omegaRad: ${formatNumber(el.omegaRad)},`,
    `${indent}  wRad: ${formatNumber(el.wRad)},`,
    `${indent}  m0Rad: ${formatNumber(el.m0Rad)},`,
    `${indent}  epochMs: ${el.epochMs},`,
    `${indent}  periodDays: ${formatNumber(el.periodDays)},`,
  ];
  return `{\n${lines.join('\n')}\n${indent}}`;
};

const isoEpoch = EPOCH.toISOString();

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(__dirname, '..', 'src', 'lib', 'orbitalElements.ts');

type PlanetEntry = { id: PlanetId; elements: OrbitalElements };
type MoonEntry = { id: MoonId; elements: OrbitalElements };

const run = async (): Promise<void> => {
  console.log(`[elements] Epoch ${isoEpoch}`);
  console.log(`[elements] Fetching NASA Horizons state vectors...`);

  const planetEntries: PlanetEntry[] = [];
  for (const id of PLANET_IDS) {
    if (id === 'sun') continue;
    process.stdout.write(`  - ${id}... `);
    const elements = await fetchElements(HORIZONS_COMMAND_IDS[id], MU_SUN);
    planetEntries.push({ id, elements });
    console.log(`a=${elements.a.toFixed(4)} AU, period=${elements.periodDays.toFixed(2)} d`);
  }

  const moonEntries: MoonEntry[] = [];
  for (const id of MOON_IDS) {
    const meta = MOON_META[id];
    const mu = MU_PARENT[meta.parent];
    if (!mu) {
      throw new Error(`Missing μ for parent "${meta.parent}" (moon "${id}")`);
    }
    const parentCenter = `500@${HORIZONS_COMMAND_IDS[meta.parent]}`;
    process.stdout.write(`  - ${id} (around ${meta.parent})... `);
    const elements = await fetchElements(meta.commandId, mu, parentCenter);
    moonEntries.push({ id, elements });
    console.log(`a=${(elements.a * 149597870.7).toFixed(0)} km, period=${elements.periodDays.toFixed(3)} d`);
  }

  const planetsBlock = planetEntries
    .map(({ id, elements }) => `  ${id}: ${formatElements(elements, '  ')},`)
    .join('\n');

  const moonsBlock = moonEntries
    .map(({ id, elements }) => `  ${id}: ${formatElements(elements, '  ')},`)
    .join('\n');

  const file = `// AUTO-GENERATED FILE – do not edit by hand.
// Regenerate with: npm run elements
// Epoch: ${isoEpoch}
// Source: NASA JPL Horizons, ecliptic J2000 frame.

import type { MoonId } from './moons';
import type { PlanetId } from './planets';
import type { OrbitalElements } from './kepler';

export const ORBITAL_EPOCH_ISO = '${isoEpoch}';
export const ORBITAL_EPOCH_MS = ${EPOCH.getTime()};

export const PLANET_ORBITAL_ELEMENTS: Readonly<
  Partial<Record<PlanetId, OrbitalElements>>
> = {
${planetsBlock}
};

export const MOON_ORBITAL_ELEMENTS: Readonly<Record<MoonId, OrbitalElements>> = {
${moonsBlock}
};
`;

  await writeFile(outPath, file, 'utf8');
  console.log(`[elements] Wrote ${outPath}`);
};

run().catch((err: unknown) => {
  console.error('[elements] Failed:', err);
  process.exit(1);
});
