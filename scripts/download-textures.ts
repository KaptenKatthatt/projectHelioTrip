import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

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

const rasterToWebpPath = (rasterPath: string): string =>
  rasterPath.replace(/\.(jpe?g|png)$/i, '.webp');

/**
 * High-quality WebP for WebGL: lossy for JPEG sources, strong alpha for PNG
 * (rings, clouds). The app loads `.webp` paths; JPG/PNG remain as authoring sources.
 */
const writeWebpSibling = async (
  rasterPath: string,
  payload: Buffer,
): Promise<void> => {
  const webpPath = rasterToWebpPath(rasterPath);
  if (webpPath === rasterPath) return;

  const lower = rasterPath.toLowerCase();
  const isPng = lower.endsWith('.png');
  const pipeline = sharp(payload);
  if (isPng) {
    await pipeline
      .webp({ quality: 96, alphaQuality: 100, effort: 5 })
      .toFile(webpPath);
  } else {
    await pipeline.webp({ quality: 92, effort: 5 }).toFile(webpPath);
  }
  const { size } = await stat(webpPath);
  console.log(
    `ok     ${relative(OUT_DIR, webpPath)} (${(size / 1024).toFixed(0)} KB)`,
  );
};

async function* walkRasterFiles(dir: string): AsyncGenerator<string> {
  if (!existsSync(dir)) return;
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      yield* walkRasterFiles(p);
    } else if (e.isFile() && /\.(jpe?g|png)$/i.test(p) && !/\.webp$/i.test(p)) {
      yield p;
    }
  }
}

/**
 * For folders with only legacy JPG/PNG (e.g. hand-placed moon textures), emit WebP
 * siblings so the runtime paths in `src/lib/textures.ts` resolve.
 */
const ensureWebpForAllRasters = async (): Promise<void> => {
  for await (const rasterPath of walkRasterFiles(OUT_DIR)) {
    const webpPath = rasterToWebpPath(rasterPath);
    if (existsSync(webpPath)) continue;
    try {
      const payload = await readFile(rasterPath);
      await writeWebpSibling(rasterPath, payload);
    } catch (err) {
      console.error(
        `fail   ${relative(OUT_DIR, rasterPath)}: ${err instanceof Error ? err.message : err}`,
      );
    }
  }
};

const writeTexture = async (entry: TextureEntry): Promise<void> => {
  const outPath = resolve(OUT_DIR, entry.target);
  const webpPath = rasterToWebpPath(outPath);

  if (existsSync(outPath)) {
    console.log(`skip   ${entry.target} (already present)`);
    if (!existsSync(webpPath)) {
      const payload = await readFile(outPath);
      await writeWebpSibling(outPath, payload);
    }
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
  await writeWebpSibling(outPath, payload);
};

const main = async (): Promise<void> => {
  console.log(
    `Downloading ${TEXTURES.length} textures to ${OUT_DIR}; writing high-quality WebP siblings for the app.`,
  );
  for (const entry of TEXTURES) {
    try {
      await writeTexture(entry);
    } catch (err) {
      console.error(
        `fail   ${entry.target}: ${err instanceof Error ? err.message : err}`,
      );
    }
  }
  await ensureWebpForAllRasters();
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
