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

const PLANET_TEXTURES: Partial<Record<PlanetId, SurfaceTextures>> = {
  sun: { diffuse: base('sun', 'diffuse.webp') },
  mercury: { diffuse: base('mercury', 'diffuse.webp') },
  venus: { diffuse: base('venus', 'diffuse.webp') },
  earth: {
    diffuse: base('earth', 'diffuse.webp'),
    normal: base('earth', 'normal.webp'),
    roughness: base('earth', 'roughness.webp'),
  },
  mars: { diffuse: base('mars', 'diffuse.webp') },
  jupiter: { diffuse: base('jupiter', 'diffuse.webp') },
  saturn: { diffuse: base('saturn', 'diffuse.webp') },
  uranus: { diffuse: base('uranus', 'diffuse.webp') },
  neptune: { diffuse: base('neptune', 'diffuse.webp') },
  pluto: { diffuse: base('pluto', 'diffuse.webp') },
};

const MOON_TEXTURES: Partial<Record<MoonId, SurfaceTextures>> = {
  moon: { diffuse: base('moon', 'diffuse.webp') },
  io: { diffuse: base('io', 'diffuse.webp') },
  europa: { diffuse: base('europa', 'diffuse.webp') },
  ganymede: { diffuse: base('ganymede', 'diffuse.webp') },
  callisto: { diffuse: base('callisto', 'diffuse.webp') },
  titan: { diffuse: base('titan', 'diffuse.webp') },
  triton: { diffuse: base('triton', 'diffuse.webp') },
};

const CLOUD_TEXTURES: Partial<Record<PlanetId, CloudTextures>> = {
  earth: { diffuse: base('earth', 'clouds.webp') },
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

/**
 * Stable load order: planets (inner → outer), then moons, then cloud maps.
 * Used by `scheduleDeferredTexturePreloads` so the GPU can warm big textures
 * without competing with first paint.
 */
export const collectOrderedSurfaceTextureUrls = (): readonly string[] => {
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (url: string | undefined): void => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    out.push(url);
  };

  for (const { id } of PLANETS) {
    const entry = PLANET_TEXTURES[id];
    if (!entry) continue;
    push(entry.diffuse);
    push(entry.normal);
    push(entry.roughness);
  }
  for (const { id } of MOONS) {
    const entry = MOON_TEXTURES[id];
    if (!entry) continue;
    push(entry.diffuse);
    push(entry.normal);
    push(entry.roughness);
  }
  for (const clouds of Object.values(CLOUD_TEXTURES)) {
    if (clouds) push(clouds.diffuse);
  }
  return out;
};
