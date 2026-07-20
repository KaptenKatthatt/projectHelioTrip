import { existsSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = resolve(fileURLToPath(import.meta.url), '..', '..');
const PUBLIC_DIR = resolve(ROOT, 'public');

/**
 * Hand-placed surface textures that ship as large PNGs. The app loads the
 * `.webp` siblings emitted here; the PNGs stay in git as authoring sources
 * (they are not re-downloadable, unlike the planet maps).
 */
const SURFACE_TEXTURES: readonly string[] = [
  'moon_texture.png',
  'moon-texture2.png',
  'textures/mars_surface.png',
];

const rasterToWebpPath = (rasterPath: string): string =>
  rasterPath.replace(/\.(jpe?g|png)$/i, '.webp');

const writeWebpSibling = async (rasterPath: string): Promise<void> => {
  const webpPath = rasterToWebpPath(rasterPath);
  if (existsSync(webpPath)) {
    console.log(`skip   ${relative(PUBLIC_DIR, webpPath)} (already present)`);
    return;
  }
  const payload = await readFile(rasterPath);
  // Tiled terrain textures are viewed close-up; quality 90 keeps the
  // MoonTerrain canvas blend artifact-free while cutting ~85-90% of the size.
  await sharp(payload).webp({ quality: 90, effort: 6 }).toFile(webpPath);
  const { size } = await stat(webpPath);
  console.log(
    `ok     ${relative(PUBLIC_DIR, webpPath)} (${(size / 1024).toFixed(0)} KB)`,
  );
};

const main = async (): Promise<void> => {
  for (const target of SURFACE_TEXTURES) {
    const rasterPath = resolve(PUBLIC_DIR, target);
    if (!existsSync(rasterPath)) {
      console.error(`fail   ${target}: source PNG not found`);
      process.exitCode = 1;
      continue;
    }
    try {
      await writeWebpSibling(rasterPath);
    } catch (err) {
      console.error(
        `fail   ${target}: ${err instanceof Error ? err.message : err}`,
      );
      process.exitCode = 1;
    }
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
