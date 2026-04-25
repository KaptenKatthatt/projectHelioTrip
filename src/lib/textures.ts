import { useTexture } from '@react-three/drei/core/Texture';
import { SRGBColorSpace, type Texture } from 'three';
import { MOONS } from './moons';
import type { MoonId } from './moons';
import { PLANETS } from './planets';
import type { PlanetId } from './planets';
import { getGraphicsPreset } from './graphicsTier';

export type SurfaceTextures = {
  diffuse: string;
  normal?: string;
  roughness?: string;
};

export type CloudTextures = {
  diffuse: string;
};

const base = (body: PlanetId | MoonId, file: string): string =>
  `/textures/${body}/${file}`;

export const PLANET_TEXTURES: Partial<Record<PlanetId, SurfaceTextures>> = {
  sun: { diffuse: base('sun', 'diffuse.jpg') },
  mercury: { diffuse: base('mercury', 'diffuse.jpg') },
  venus: { diffuse: base('venus', 'diffuse.jpg') },
  earth: {
    diffuse: base('earth', 'diffuse.jpg'),
    normal: base('earth', 'normal.jpg'),
    roughness: base('earth', 'roughness.jpg'),
  },
  mars: { diffuse: base('mars', 'diffuse.jpg') },
  jupiter: { diffuse: base('jupiter', 'diffuse.jpg') },
  saturn: { diffuse: base('saturn', 'diffuse.jpg') },
  uranus: { diffuse: base('uranus', 'diffuse.jpg') },
  neptune: { diffuse: base('neptune', 'diffuse.jpg') },
  pluto: { diffuse: base('pluto', 'diffuse.jpg') },
};

export const MOON_TEXTURES: Partial<Record<MoonId, SurfaceTextures>> = {
  moon: { diffuse: base('moon', 'diffuse.jpg') },
  io: { diffuse: base('io', 'diffuse.jpg') },
  europa: { diffuse: base('europa', 'diffuse.jpg') },
  ganymede: { diffuse: base('ganymede', 'diffuse.jpg') },
  callisto: { diffuse: base('callisto', 'diffuse.jpg') },
  titan: { diffuse: base('titan', 'diffuse.jpg') },
  triton: { diffuse: base('triton', 'diffuse.jpg') },
};

export const CLOUD_TEXTURES: Partial<Record<PlanetId, CloudTextures>> = {
  earth: { diffuse: base('earth', 'clouds.png') },
};

export const getSurfaceTextures = (
  id: PlanetId,
): SurfaceTextures | undefined => PLANET_TEXTURES[id];

export const getMoonTextures = (id: MoonId): SurfaceTextures | undefined =>
  MOON_TEXTURES[id];

export const getCloudTextures = (id: PlanetId): CloudTextures | undefined =>
  CLOUD_TEXTURES[id];

/**
 * Applies the canonical color-map setup (sRGB + anisotropic filtering).
 * Tolerates either the single- or array-shaped result of drei's
 * `useTexture`, which types its onLoad callback as `Texture | Texture[]`.
 */
export const configureColorMap = (tex: Texture | Texture[]): void => {
  const maxAniso = getGraphicsPreset().textureAnisotropy;
  if (Array.isArray(tex)) {
    for (const t of tex) {
      t.colorSpace = SRGBColorSpace;
      t.anisotropy = maxAniso;
    }
    return;
  }
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = maxAniso;
};

/** Data maps (normal, roughness, etc.) stay in linear space. */
export const configureDataMap = (tex: Texture | Texture[]): void => {
  const maxAniso = getGraphicsPreset().textureAnisotropy;
  if (Array.isArray(tex)) {
    for (const t of tex) {
      t.anisotropy = maxAniso;
    }
    return;
  }
  tex.anisotropy = maxAniso;
};

const collectUrls = (): string[] => {
  const urls = new Set<string>();
  const surfaces: Partial<Record<string, SurfaceTextures>>[] = [
    PLANET_TEXTURES,
    MOON_TEXTURES,
  ];
  for (const map of surfaces) {
    for (const entry of Object.values(map)) {
      if (!entry) continue;
      urls.add(entry.diffuse);
      if (entry.normal) urls.add(entry.normal);
      if (entry.roughness) urls.add(entry.roughness);
    }
  }
  for (const entry of Object.values(CLOUD_TEXTURES)) {
    if (entry) urls.add(entry.diffuse);
  }
  return Array.from(urls);
};

for (const url of collectUrls()) {
  useTexture.preload(url);
}
