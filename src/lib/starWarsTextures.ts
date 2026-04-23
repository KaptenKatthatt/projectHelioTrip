import type { StarWarsBodyId } from './starWarsSystems';

export type StarWarsSurfaceTextures = {
  enabled?: boolean;
  diffuse: string;
  normal?: string;
  roughness?: string;
};

const swBase = (body: StarWarsBodyId, file: string): string =>
  `/textures/star-wars/${body}/${file}`;

export const STAR_WARS_TEXTURES: Partial<
  Record<StarWarsBodyId, StarWarsSurfaceTextures>
> = {
  'death-star': {
    enabled: true,
    diffuse: swBase('death-star', 'diffuse.jpg'),
  },
  alderaan: {
    enabled: true,
    diffuse: swBase('alderaan', 'diffuse.jpg'),
  },
  yavin: {
    enabled: true,
    diffuse: swBase('yavin', 'diffuse.jpg'),
  },
  'yavin-4': {
    enabled: true,
    diffuse: swBase('yavin-4', 'diffuse.jpg'),
  },
  hoth: {
    enabled: true,
    diffuse: swBase('hoth', 'diffuse.jpg'),
  },
  endor: {
    enabled: true,
    diffuse: swBase('endor', 'diffuse.jpg'),
  },
  'kef-bir': {
    enabled: true,
    diffuse: swBase('kef-bir', 'diffuse.jpg'),
  },
  coruscant: {
    enabled: true,
    diffuse: swBase('coruscant', 'diffuse.jpg'),
  },
  naboo: {
    enabled: true,
    diffuse: swBase('naboo', 'diffuse.jpg'),
  },
  tatooine: {
    enabled: true,
    diffuse: swBase('tatooine', 'diffuse.jpg'),
  },
  kamino: {
    enabled: true,
    diffuse: swBase('kamino', 'diffuse.jpg'),
  },
  geonosis: {
    enabled: true,
    diffuse: swBase('geonosis', 'diffuse.jpg'),
  },
  kashyyyk: {
    enabled: true,
    diffuse: swBase('kashyyyk', 'diffuse.jpg'),
  },
  mustafar: {
    enabled: true,
    diffuse: swBase('mustafar', 'diffuse.jpg'),
  },
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
