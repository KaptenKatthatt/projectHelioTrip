import type { StarWarsBodyId } from './starWarsSystems';

export type StarWarsSurfaceTextures = {
  diffuse: string;
  normal?: string;
  roughness?: string;
};

const swBase = (body: StarWarsBodyId, file: string): string =>
  `/textures/star-wars/${body}/${file}`;

/**
 * V1 uses local placeholder textures to validate the full pipeline.
 * Replace paths with final licensed assets per body when available.
 */
export const STAR_WARS_TEXTURES: Partial<
  Record<StarWarsBodyId, StarWarsSurfaceTextures>
> = {
  'death-star': { diffuse: '/textures/moon/diffuse.jpg' },
  alderaan: { diffuse: '/textures/earth/diffuse.jpg' },
  yavin: { diffuse: '/textures/jupiter/diffuse.jpg' },
  'yavin-4': { diffuse: '/textures/earth/diffuse.jpg' },
  hoth: { diffuse: '/textures/moon/diffuse.jpg' },
  endor: { diffuse: '/textures/earth/diffuse.jpg' },
  'kef-bir': { diffuse: '/textures/neptune/diffuse.jpg' },
  coruscant: { diffuse: '/textures/mercury/diffuse.jpg' },
  naboo: { diffuse: '/textures/earth/diffuse.jpg' },
  tatooine: { diffuse: '/textures/mars/diffuse.jpg' },
  kamino: { diffuse: '/textures/neptune/diffuse.jpg' },
  geonosis: { diffuse: '/textures/mars/diffuse.jpg' },
  kashyyyk: { diffuse: '/textures/earth/diffuse.jpg' },
  mustafar: { diffuse: '/textures/mars/diffuse.jpg' },
};

export const getStarWarsSurfaceTextures = (
  id: StarWarsBodyId,
): StarWarsSurfaceTextures | undefined => STAR_WARS_TEXTURES[id];

/**
 * Reserved helper for final per-body assets when we move away from placeholders.
 */
export const getStarWarsTexturePath = (
  body: StarWarsBodyId,
  file: string,
): string => swBase(body, file);
