import * as THREE from 'three';
import { terrainRng } from '../../../lib/terrainRng';
import type { MoonRockInstance } from './types';

export const buildMoonTerrainGeometryAndRocks = (): {
  geometry: THREE.PlaneGeometry;
  rocks: MoonRockInstance[];
} => {
  const rnd = terrainRng(0x4d6f6f6e); // "Moon" in ASCII hex

  const geo = new THREE.PlaneGeometry(300, 300, 64, 64);
  geo.rotateX(-Math.PI / 2);

  const positions = geo.attributes.position!.array as Float32Array;

  // Shallower noise than Mars — Tranquility Base is relatively flat
  const noise = (x: number, z: number): number =>
    Math.sin(x * 0.04) * Math.cos(z * 0.04) * 2.5 +
    Math.sin(x * 0.08) * Math.cos(z * 0.09) * 0.8 +
    Math.sin(x * 0.15 + z * 0.12) * 0.3;

  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i] ?? 0;
    const z = positions[i + 2] ?? 0;
    const distFromCenter = Math.sqrt(x * x + z * z);
    const flattenFactor = Math.min(1, Math.max(0, (distFromCenter - 6) / 12));
    positions[i + 1] = noise(x, z) * flattenFactor - 0.05;
  }

  geo.computeVertexNormals();

  const rockData: MoonRockInstance[] = [];
  const count = 150;

  for (let i = 0; i < count; i++) {
    const rx = (rnd() - 0.5) * 200;
    const rz = (rnd() - 0.5) * 200;
    const dist = Math.sqrt(rx * rx + rz * rz);
    if (dist < 6) continue;

    const flattenFactor = Math.min(1, Math.max(0, (dist - 6) / 12));
    const ry = noise(rx, rz) * flattenFactor;

    // Moon rocks are smaller and flatter than Mars rocks
    const baseScale = rnd() * 1.2 + 0.3 + (dist > 50 ? rnd() * 2 : 0);

    rockData.push({
      position: [rx, ry - baseScale * 0.2, rz],
      rotation: [rnd() * Math.PI, rnd() * Math.PI, rnd() * Math.PI],
      scale: [
        baseScale * (0.5 + rnd() * 1.2),
        baseScale * (0.2 + rnd() * 0.5),
        baseScale * (0.5 + rnd() * 1.2),
      ],
    });
  }

  return { geometry: geo, rocks: rockData };
};
