import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STAR_WARS_TEXTURE_SOURCES } from './starWarsTextureSources';

type Source =
  | { kind: 'copy'; url: string }
  | { kind: 'invert'; url: string };

type TextureEntry = {
  target: string;
  source: Source;
};

const SSS = (name: string) =>
  `https://www.solarsystemscope.com/textures/download/${name}`;
const TJS = (name: string) =>
  `https://threejs.org/examples/textures/planets/${name}`;

const TEXTURES: readonly TextureEntry[] = [
  { target: 'sun/diffuse.jpg', source: { kind: 'copy', url: SSS('2k_sun.jpg') } },
  {
    target: 'mercury/diffuse.jpg',
    source: { kind: 'copy', url: SSS('2k_mercury.jpg') },
  },
  {
    target: 'venus/diffuse.jpg',
    source: { kind: 'copy', url: SSS('2k_venus_surface.jpg') },
  },
  {
    target: 'earth/diffuse.jpg',
    source: { kind: 'copy', url: SSS('2k_earth_daymap.jpg') },
  },
  {
    target: 'earth/normal.jpg',
    source: { kind: 'copy', url: TJS('earth_normal_2048.jpg') },
  },
  {
    // Three.js ships a specular map (bright = shiny). Roughness is the
    // inverse (bright = rough), so invert during download.
    target: 'earth/roughness.jpg',
    source: { kind: 'invert', url: TJS('earth_specular_2048.jpg') },
  },
  {
    target: 'earth/clouds.png',
    source: { kind: 'copy', url: TJS('earth_clouds_1024.png') },
  },
  { target: 'mars/diffuse.jpg', source: { kind: 'copy', url: SSS('2k_mars.jpg') } },
  {
    target: 'jupiter/diffuse.jpg',
    source: { kind: 'copy', url: SSS('2k_jupiter.jpg') },
  },
  {
    target: 'saturn/diffuse.jpg',
    source: { kind: 'copy', url: SSS('2k_saturn.jpg') },
  },
  {
    target: 'saturn/ring.png',
    source: { kind: 'copy', url: SSS('2k_saturn_ring_alpha.png') },
  },
  {
    target: 'uranus/diffuse.jpg',
    source: { kind: 'copy', url: SSS('2k_uranus.jpg') },
  },
  {
    target: 'neptune/diffuse.jpg',
    source: { kind: 'copy', url: SSS('2k_neptune.jpg') },
  },
  {
    target: 'moon/diffuse.jpg',
    source: { kind: 'copy', url: SSS('2k_moon.jpg') },
  },
];

const STAR_WARS_TEXTURES: readonly TextureEntry[] = Object.entries(
  STAR_WARS_TEXTURE_SOURCES,
).flatMap(([bodyId, sources]) =>
  sources.map((source) => ({
    target: `star-wars/${bodyId}/${source.targetFile}`,
    source: { kind: source.kind, url: source.url } as Source,
  })),
);

const ALL_TEXTURES: readonly TextureEntry[] = [...TEXTURES, ...STAR_WARS_TEXTURES];

const ROOT = resolve(fileURLToPath(import.meta.url), '..', '..');
const OUT_DIR = resolve(ROOT, 'public', 'textures');

const fetchBuffer = async (url: string): Promise<Buffer> => {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; ProjectHelioTrip-TextureFetcher/1.0)',
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to download ${url}: ${res.status} ${res.statusText}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

const invertJpeg = (input: Buffer): Buffer =>
  execFileSync('convert', ['-', '-negate', 'jpg:-'], {
    input,
    maxBuffer: 64 * 1024 * 1024,
  });

const writeTexture = async (entry: TextureEntry): Promise<void> => {
  const outPath = resolve(OUT_DIR, entry.target);
  if (existsSync(outPath)) {
    console.log(`skip   ${entry.target} (already present)`);
    return;
  }

  await mkdir(dirname(outPath), { recursive: true });
  const raw = await fetchBuffer(entry.source.url);
  const payload =
    entry.source.kind === 'invert' ? invertJpeg(raw) : raw;
  await writeFile(outPath, payload);
  console.log(
    `ok     ${entry.target} (${(payload.byteLength / 1024).toFixed(0)} KB)`,
  );
};

const main = async (): Promise<void> => {
  console.log(`Downloading ${ALL_TEXTURES.length} textures to ${OUT_DIR}`);
  for (const entry of ALL_TEXTURES) {
    try {
      await writeTexture(entry);
    } catch (err) {
      console.error(
        `fail   ${entry.target}: ${err instanceof Error ? err.message : err}`,
      );
    }
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
