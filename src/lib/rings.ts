import { useTexture } from '@react-three/drei';
import type { PlanetId } from './planets';
import type { RingGap } from './ringTexture';

export type RingDefinition = {
  /** Inner radius as a multiple of planet radius. */
  innerScale: number;
  /** Outer radius as a multiple of planet radius. */
  outerScale: number;
  /** Axial tilt of the ring plane, in radians. */
  tilt: number;
  /** Optional diffuse texture. When omitted, a procedural ring is generated. */
  texture?: string;
  /** Base tint: used either as procedural base color or fallback color. */
  color: string;
  /** Overall opacity multiplier. */
  opacity: number;
  /** Slow angular spin around the ring's own normal (rad/s). */
  spin: number;
  /** Seed for procedural noise and particle placement. */
  seed: number;
  /** Optional gap lanes carved into the procedural ring. */
  gaps?: readonly RingGap[];
  /** Number of debris particles scattered in the ring plane. */
  particleCount: number;
  /** Particle world-space size. */
  particleSize: number;
};

const deg = (d: number): number => (d * Math.PI) / 180;

export const RING_DEFINITIONS: Partial<Record<PlanetId, RingDefinition>> = {
  jupiter: {
    innerScale: 1.4,
    outerScale: 1.8,
    tilt: deg(3.13),
    color: '#b89074',
    opacity: 0.18,
    spin: 0.02,
    seed: 17,
    gaps: [{ position: 0.55, width: 0.35, depth: 0.15 }],
    particleCount: 1400,
    particleSize: 0.012,
  },
  saturn: {
    innerScale: 1.5,
    outerScale: 2.4,
    tilt: deg(26.73),
    texture: '/textures/saturn/ring.png',
    color: '#d7c29a',
    opacity: 1,
    spin: 0.015,
    seed: 3,
    particleCount: 500,
    particleSize: 0.07,
  },
  uranus: {
    innerScale: 1.6,
    outerScale: 2.05,
    tilt: deg(97.77),
    color: '#b3d3dc',
    opacity: 0.7,
    spin: 0.025,
    seed: 29,
    gaps: [
      { position: 0.25, width: 0.06, depth: 0.7 },
      { position: 0.55, width: 0.07, depth: 0.6 },
      { position: 0.82, width: 0.05, depth: 0.5 },
    ],
    particleCount: 260,
    particleSize: 0.07,
  },
  neptune: {
    innerScale: 1.55,
    outerScale: 2.4,
    tilt: deg(28.32),
    color: '#7a96bd',
    opacity: 0.5,
    spin: 0.018,
    seed: 41,
    gaps: [
      { position: 0.2, width: 0.07, depth: 0.65 },
      { position: 0.6, width: 0.06, depth: 0.55 },
      { position: 0.88, width: 0.04, depth: 0.45 },
    ],
    particleCount: 220,
    particleSize: 0.08,
  },
};

export const getRingDefinition = (id: PlanetId): RingDefinition | undefined =>
  RING_DEFINITIONS[id];

for (const def of Object.values(RING_DEFINITIONS)) {
  if (def?.texture) useTexture.preload(def.texture);
}
