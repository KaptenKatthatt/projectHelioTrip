import type { StarWarsBodyId } from './starWarsSystems';

export type StarWarsSurfaceTextures = {
  enabled?: boolean;
  diffuse: string;
  normal?: string;
  roughness?: string;
};

const swBase = (body: StarWarsBodyId, file: string): string =>
  `/textures/star-wars/${body}/${file}`;

const sw = (body: StarWarsBodyId): StarWarsSurfaceTextures => ({
  enabled: false,
  diffuse: swBase(body, 'diffuse.jpg'),
});

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
  yavin: sw('yavin'),
  'yavin-4': sw('yavin-4'),
  hoth: sw('hoth'),
  endor: sw('endor'),
  'kef-bir': sw('kef-bir'),
  coruscant: sw('coruscant'),
  naboo: sw('naboo'),
  tatooine: sw('tatooine'),
  kamino: sw('kamino'),
  geonosis: sw('geonosis'),
  kashyyyk: sw('kashyyyk'),
  mustafar: sw('mustafar'),
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
