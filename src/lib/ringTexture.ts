import {
  CanvasTexture,
  Color,
  LinearMipmapLinearFilter,
  RepeatWrapping,
  SRGBColorSpace,
} from 'three';

export type RingGap = {
  /** Radial position along [0,1] where the gap is centered (0=inner, 1=outer). */
  position: number;
  /** Half-width of the gap lane along the radial axis. */
  width: number;
  /** How deep the gap cuts into ring density (0..1). */
  depth: number;
};

type RingTextureOptions = {
  baseColor: string;
  seed: number;
  gaps?: readonly RingGap[];
};

const TEXTURE_WIDTH = 2048;
const TEXTURE_HEIGHT = 4;

const createNoise1D = (seed: number) => {
  const hash = (x: number): number => {
    const s = Math.sin(x * 127.1 + seed * 311.7) * 43758.5453;
    return s - Math.floor(s);
  };
  const smooth = (t: number): number => t * t * (3 - 2 * t);
  return (x: number): number => {
    const xi = Math.floor(x);
    const xf = x - xi;
    const t = smooth(xf);
    return hash(xi) * (1 - t) + hash(xi + 1) * t;
  };
};

/**
 * Generates a 1D-style ring texture (radial bands) procedurally so planets
 * without a bespoke asset still look like a debris disk rather than a flat
 * colored disc. The horizontal axis maps to radial distance; vertical is
 * uniform so UVs can be remapped to radial position.
 */
export const createProceduralRingTexture = (
  opts: RingTextureOptions,
): CanvasTexture => {
  const { baseColor, seed, gaps = [] } = opts;

  const canvas = document.createElement('canvas');
  canvas.width = TEXTURE_WIDTH;
  canvas.height = TEXTURE_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas context unavailable');

  const image = ctx.createImageData(TEXTURE_WIDTH, TEXTURE_HEIGHT);
  const data = image.data;

  const color = new Color(baseColor);
  const broad = createNoise1D(seed);
  const mid = createNoise1D(seed + 17);
  const fine = createNoise1D(seed + 53);

  for (let x = 0; x < TEXTURE_WIDTH; x++) {
    const r = x / (TEXTURE_WIDTH - 1);

    let density =
      broad(r * 6) * 0.55 + mid(r * 22) * 0.3 + fine(r * 96) * 0.15;
    density = Math.max(0, Math.min(1, density));

    const innerFade = Math.min(1, r * 14);
    const outerFade = Math.min(1, (1 - r) * 16);
    density *= innerFade * outerFade;

    for (const gap of gaps) {
      const d = Math.abs(r - gap.position) / gap.width;
      if (d < 1) density *= 1 - gap.depth * (1 - d * d);
    }

    const shade = 0.7 + mid(r * 11) * 0.45;
    const red = Math.min(255, Math.round(color.r * shade * 255));
    const green = Math.min(255, Math.round(color.g * shade * 255));
    const blue = Math.min(255, Math.round(color.b * shade * 255));
    const alpha = Math.round(Math.max(0, Math.min(1, density)) * 255);

    for (let y = 0; y < TEXTURE_HEIGHT; y++) {
      const i = (y * TEXTURE_WIDTH + x) * 4;
      data[i] = red;
      data[i + 1] = green;
      data[i + 2] = blue;
      data[i + 3] = alpha;
    }
  }

  ctx.putImageData(image, 0, 0);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = RepeatWrapping;
  texture.anisotropy = 8;
  texture.generateMipmaps = true;
  texture.minFilter = LinearMipmapLinearFilter;
  return texture;
};
