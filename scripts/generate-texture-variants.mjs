/**
 * Emits downscaled copies of the surface textures, one per rung of the
 * quality ladder that asks for a smaller cap than the source.
 *
 * Why this exists: a WebP is small on the wire and enormous in VRAM. The
 * browser decodes it to RGBA8 before upload, so `europa/diffuse.webp` costs
 * 1.6 MB to download and 33 MB of video memory — 45 MB once three builds its
 * mipmap chain. Across every body the full set is roughly 289 MB, on a moon
 * that covers a few dozen pixels. Integrated GPUs share that memory with the
 * system and have very little cache in front of it, which makes this the
 * largest single cost the ladder had not yet been able to touch.
 *
 * Variants are checked in rather than generated during the build: `sharp` is
 * a native module, resizing 22 textures takes appreciably longer than the
 * rest of the build, and a deploy should never be able to fail on it. Re-run
 * this by hand when a source texture changes.
 *
 *   node scripts/generate-texture-variants.mjs [--check]
 *
 * `--check` verifies every expected variant exists and that the generated
 * manifest still describes the textures on disk, without writing anything.
 * That is what CI runs.
 */

import { readdir, stat, mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import sharp from 'sharp';

const TEXTURE_ROOT = path.join(process.cwd(), 'public', 'textures');

/**
 * Must stay in step with the `textureMaxSize` values in
 * `src/lib/quality/qualityLevels.ts`. The unit test asserts they agree, so
 * adding a rung there without a variant here fails the build rather than
 * silently serving a texture that does not exist.
 */
export const VARIANT_SIZES = [2048, 1024, 512];

/** WebP quality. Matches what the source textures were encoded at. */
const WEBP_QUALITY = 82;

const isSourceTexture = (name) =>
  name.endsWith('.webp') && !/-\d+\.webp$/.test(name);

const collectSources = async (dir) => {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await collectSources(full)));
    } else if (isSourceTexture(entry.name)) {
      out.push(full);
    }
  }
  return out;
};

export const variantPath = (source, size) =>
  source.replace(/\.webp$/, `-${size}.webp`);

const run = async () => {
  const check = process.argv.includes('--check');
  const sources = (await collectSources(TEXTURE_ROOT)).sort();
  if (sources.length === 0) {
    console.error('No source textures found under public/textures.');
    process.exitCode = 1;
    return;
  }

  let written = 0;
  let skipped = 0;
  const missing = [];
  /** url -> { native, sizes } for the generated manifest. */
  const manifest = new Map();

  for (const source of sources) {
    const meta = await sharp(source).metadata();
    const longest = Math.max(meta.width ?? 0, meta.height ?? 0);

    for (const size of VARIANT_SIZES) {
      const target = variantPath(source, size);
      const url = `/${path.relative(path.join(process.cwd(), 'public'), source).split(path.sep).join('/')}`;
      const entry = manifest.get(url) ?? { native: longest, sizes: [] };
      if (longest > size) entry.sizes.push(size);
      manifest.set(url, entry);

      // Nothing to gain from upscaling: a rung whose cap is at or above the
      // source resolution simply uses the source file.
      if (longest <= size) {
        skipped += 1;
        continue;
      }

      if (check) {
        if (!existsSync(target)) {
          missing.push(path.relative(process.cwd(), target));
        }
        // Deliberately no mtime comparison. Git does not record mtimes, and it
        // writes a tree in index order -- `diffuse-1024.webp` sorts before
        // `diffuse.webp`, so on any fresh checkout every variant looks older
        // than its source and the check would fail for all of them. Drift in
        // the source is caught instead by the manifest comparison below, which
        // re-reads each source's real dimensions with sharp.
        continue;
      }

      await mkdir(path.dirname(target), { recursive: true });
      await sharp(source)
        .resize({ width: size, height: size, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toFile(target);

      const { size: bytes } = await stat(target);
      console.log(
        `${path.relative(process.cwd(), target)}  ${(bytes / 1024).toFixed(0)} KB`,
      );
      written += 1;
    }
  }

  const manifestSource = renderManifest(manifest);
  const manifestPath = path.join(
    process.cwd(),
    'src',
    'lib',
    'quality',
    'textureVariants.generated.ts',
  );

  if (check) {
    const onDisk = existsSync(manifestPath)
      ? await readFile(manifestPath, 'utf8')
      : '';
    const manifestDrifted = onDisk !== manifestSource;
    if (manifestDrifted) {
      console.error(
        'src/lib/quality/textureVariants.generated.ts does not match the textures on disk.',
      );
    }
    if (missing.length || manifestDrifted) {
      for (const file of missing) console.error(`missing variant: ${file}`);
      console.error(
        '\nRun `node scripts/generate-texture-variants.mjs` and commit the result.',
      );
      process.exitCode = 1;
      return;
    }
    console.log(`All texture variants present for ${sources.length} sources.`);
    return;
  }

  await writeFile(manifestPath, manifestSource);
  console.log(
    `\n${written} variants written, ${skipped} skipped (source already at or below the cap).`,
  );
  console.log('Manifest: src/lib/quality/textureVariants.generated.ts');
};

const renderManifest = (manifest) => {
  const entries = [...manifest.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(
      ([url, { native, sizes }]) =>
        `  '${url}': { native: ${native}, sizes: [${[...sizes].sort((a, b) => b - a).join(', ')}] },`,
    )
    .join('\n');

  return `/**
 * Generated by \`scripts/generate-texture-variants.mjs\`. Do not edit by hand.
 *
 * Maps each source texture to its native longest edge and the downscaled
 * sizes that exist on disk. \`native\` is what tells a caller whether the
 * source itself already fits a cap -- without it, the top rung would pick a
 * downscaled variant for a texture it was supposed to load at full size.
 */

export type TextureVariantEntry = {
  readonly native: number;
  readonly sizes: readonly number[];
};

export const TEXTURE_VARIANTS: Readonly<Record<string, TextureVariantEntry>> = {
${entries}
};
`;
};

await run();
