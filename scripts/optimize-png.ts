import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = resolve(fileURLToPath(import.meta.url), '..', '..');
const PUBLIC_DIR = resolve(ROOT, 'public');

/**
 * Deployed PNGs to recompress losslessly. PNG is a lossless format, so a
 * max-effort re-encode changes bytes but never pixels — and this script
 * verifies that by decoding both versions to raw RGBA and comparing.
 * The moon terrain PNGs are deliberately absent: they are deploy-excluded
 * authoring sources.
 */
const TARGETS: readonly string[] = [
  'og-link-preview.png',
  'lander_icon.png',
  'mars-rover-icon.png',
  'pwa-192x192.png',
  'pwa-512x512.png',
  'pwa-maskable-512x512.png',
  'apple-touch-icon.png',
];

const decodeRaw = (png: Buffer): Promise<Buffer> =>
  sharp(png).ensureAlpha().raw().toBuffer();

const main = async (): Promise<void> => {
  for (const name of TARGETS) {
    const path = resolve(PUBLIC_DIR, name);
    const original = await readFile(path);
    const candidate = await sharp(original)
      .png({ compressionLevel: 9, effort: 10, palette: false })
      .toBuffer();

    if (candidate.length >= original.length) {
      console.log(`skip   ${name} (already optimal)`);
      continue;
    }
    const [rawA, rawB] = await Promise.all([
      decodeRaw(original),
      decodeRaw(candidate),
    ]);
    if (!rawA.equals(rawB)) {
      console.error(`fail   ${name}: pixels differ after re-encode, keeping original`);
      process.exitCode = 1;
      continue;
    }
    await writeFile(path, candidate);
    const saved = original.length - candidate.length;
    console.log(
      `ok     ${name} (${(original.length / 1024).toFixed(0)} -> ${(candidate.length / 1024).toFixed(0)} KB, -${(saved / 1024).toFixed(0)} KB, pixel-identical)`,
    );
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
