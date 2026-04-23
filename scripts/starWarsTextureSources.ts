export type StarWarsTextureSource = {
  readonly targetFile: 'diffuse.jpg' | 'normal.jpg' | 'roughness.jpg';
  readonly kind: StarWarsTextureSourceKind;
  readonly url: string;
};

type StarWarsTextureSourceKind = 'copy' | 'invert';

/**
 * Add licensed/canon-approved URLs per body.
 * Only populated fields are downloaded.
 */
export const STAR_WARS_TEXTURE_SOURCES: Readonly<
  Record<string, readonly StarWarsTextureSource[]>
> = {
  'death-star': [],
  alderaan: [],
  yavin: [],
  'yavin-4': [],
  hoth: [],
  endor: [],
  'kef-bir': [],
  coruscant: [],
  naboo: [],
  tatooine: [],
  kamino: [],
  geonosis: [],
  kashyyyk: [],
  mustafar: [],
};
