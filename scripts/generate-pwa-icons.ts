import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = resolve(fileURLToPath(import.meta.url), '..', '..');
const PUBLIC_DIR = resolve(ROOT, 'public');
const SOURCE_SVG = resolve(PUBLIC_DIR, 'saturn-favicon.svg');
const SOURCE_VIEWBOX = 64;
const BACKGROUND = '#0b1020';

/** Rasterize the source SVG to a square PNG buffer of the given size. */
const rasterize = async (size: number): Promise<Buffer> => {
  const svg = await readFile(SOURCE_SVG);
  // Scale via density so librsvg renders at full resolution instead of
  // upscaling a 64px bitmap.
  const density = (72 * size) / SOURCE_VIEWBOX;
  return sharp(svg, { density }).resize(size, size).png().toBuffer();
};

/** Center the icon on an opaque canvas, scaled to fit the safe zone. */
const composeOnCanvas = async (
  canvasSize: number,
  iconSize: number,
): Promise<Buffer> => {
  const icon = await rasterize(iconSize);
  return sharp({
    create: {
      width: canvasSize,
      height: canvasSize,
      channels: 4,
      background: BACKGROUND,
    },
  })
    .composite([{ input: icon, gravity: 'center' }])
    .png()
    .toBuffer();
};

const writeIcon = async (name: string, payload: Buffer): Promise<void> => {
  const path = resolve(PUBLIC_DIR, name);
  await sharp(payload).toFile(path);
  console.log(`ok     ${name}`);
};

const main = async (): Promise<void> => {
  await writeIcon('pwa-192x192.png', await rasterize(192));
  await writeIcon('pwa-512x512.png', await rasterize(512));
  // Maskable icons must keep all content inside the central ~80% safe zone;
  // 66% leaves margin for the most aggressive masks.
  await writeIcon(
    'pwa-maskable-512x512.png',
    await composeOnCanvas(512, Math.round(512 * 0.66)),
  );
  // iOS renders transparency as black; use an opaque background.
  await writeIcon(
    'apple-touch-icon.png',
    await composeOnCanvas(180, Math.round(180 * 0.8)),
  );
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
