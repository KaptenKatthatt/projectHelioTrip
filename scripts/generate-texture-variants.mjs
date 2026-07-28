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
 * `--check` verifies every expected variant exists, that the generated
 * manifest still describes the textures on disk, and that every source's
 * content hash matches the one recorded at generation time -- so a source
 * replaced with new artwork at the same dimensions is caught, not just one
 * whose size changed. Hashes, unlike mtimes, survive a fresh checkout. That
 * is what CI runs; it writes nothing.
 */

import { readdir, stat, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import process from 'node:process';
import sharp from 'sharp';

const TEXTURE_ROOT = path.join(process.cwd(), 'public', 'textures');
/**
 * Content hash of every source at the time its variants were generated.
 * Checked in beside the script; read only by `--check`. This is what lets CI
 * catch a source replaced with new artwork at the *same* dimensions -- the
 * manifest comparison alone only sees sizes.
 */
const HASHES_PATH = path.join(process.cwd(), 'scripts', 'texture-variant-hashes.json');

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

const isVariantTexture = (name) => /-\d+\.webp$/.test(name);

const collectFiles = async (dir, predicate) => {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await collectFiles(full, predicate)));
    } else if (predicate(entry.name)) {
      out.push(full);
    }
  }
  return out;
};

export const variantPath = (source, size) =>
  source.replace(/\.webp$/, `-${size}.webp`);

const run = async () => {
  const check = process.argv.includes('--check');
  const sources = (await collectFiles(TEXTURE_ROOT, isSourceTexture)).sort();
  if (sources.length === 0) {
    console.error('No source textures found under public/textures.');
    process.exitCode = 1;
    return;
  }

  let written = 0;
  let skipped = 0;
  const missing = [];
  const staleSources = [];
  /** Every variant a current source justifies; anything else on disk is an orphan. */
  const expectedVariants = new Set();
  /** url -> { native, sizes } for the generated manifest. */
  const manifest = new Map();
  /** repo-relative source path -> sha256 of its bytes. */
  const hashes = {};
  const recordedHashes = existsSync(HASHES_PATH)
    ? JSON.parse(await readFile(HASHES_PATH, 'utf8'))
    : {};

  for (const source of sources) {
    const rel = path.relative(process.cwd(), source).split(path.sep).join('/');
    const payload = await readFile(source);
    hashes[rel] = createHash('sha256').update(payload).digest('hex');

    // One decode per source, shared by every size below. The image is handed
    // to sharp as bytes we already read for the hash, so the file is touched
    // exactly once however many variants it yields.
    const image = sharp(payload);
    const meta = await image.metadata();
    const longest = Math.max(meta.width ?? 0, meta.height ?? 0);

    const url = `/${path.relative(path.join(process.cwd(), 'public'), source).split(path.sep).join('/')}`;
    const wantedSizes = VARIANT_SIZES.filter((size) => longest > size);
    manifest.set(url, { native: longest, sizes: wantedSizes });
    skipped += VARIANT_SIZES.length - wantedSizes.length;
    for (const size of wantedSizes) expectedVariants.add(variantPath(source, size));

    if (check) {
      // Mtimes would be the obvious staleness signal, but git records none
      // and writes a tree in index order -- on a fresh checkout every variant
      // looks older than its source. Content hashes survive a checkout.
      if (recordedHashes[rel] !== hashes[rel]) staleSources.push(rel);
      for (const size of wantedSizes) {
        const target = variantPath(source, size);
        if (!existsSync(target)) {
          missing.push(path.relative(process.cwd(), target));
        }
      }
      continue;
    }

    await Promise.all(
      wantedSizes.map(async (size) => {
        const target = variantPath(source, size);
        await mkdir(path.dirname(target), { recursive: true });
        await image
          .clone()
          .resize({ width: size, height: size, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: WEBP_QUALITY })
          .toFile(target);
        const { size: bytes } = await stat(target);
        console.log(
          `${path.relative(process.cwd(), target)}  ${(bytes / 1024).toFixed(0)} KB`,
        );
        written += 1;
      }),
    );
  }

  /**
   * A variant whose source shrank (or vanished) is not referenced by the
   * manifest, so it can never 404 -- but it stays committed and deployed
   * forever, invisible to a check that only looks for *missing* files.
   */
  const orphans = (await collectFiles(TEXTURE_ROOT, isVariantTexture)).filter(
    (file) => !expectedVariants.has(file),
  );

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
    // Compared with line endings normalized: a Windows checkout with
    // autocrlf rewrites the file to CRLF, which is not drift.
    const normalize = (text) => text.replaceAll('\r\n', '\n');
    const manifestDrifted = normalize(onDisk) !== normalize(manifestSource);
    if (manifestDrifted) {
      console.error(
        'src/lib/quality/textureVariants.generated.ts does not match the textures on disk.',
      );
    }
    if (missing.length || staleSources.length || orphans.length || manifestDrifted) {
      for (const file of missing) console.error(`missing variant: ${file}`);
      for (const file of staleSources) {
        console.error(`source changed since variants were generated: ${file}`);
      }
      for (const file of orphans) {
        console.error(
          `orphaned variant (no current source justifies it): ${path.relative(process.cwd(), file)}`,
        );
      }
      console.error(
        '\nRun `node scripts/generate-texture-variants.mjs` and commit the result.',
      );
      process.exitCode = 1;
      return;
    }
    console.log(
      `All texture variants present and sources unchanged for ${sources.length} sources.`,
    );
    return;
  }

  for (const file of orphans) {
    await rm(file);
    console.log(`removed orphan ${path.relative(process.cwd(), file)}`);
  }
  await writeFile(manifestPath, manifestSource);
  await writeFile(HASHES_PATH, `${JSON.stringify(hashes, null, 2)}\n`);
  console.log(
    `\n${written} variants written, ${skipped} skipped (source already at or below the cap).`,
  );
  console.log('Manifest: src/lib/quality/textureVariants.generated.ts');
  console.log('Hashes:   scripts/texture-variant-hashes.json');
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

// Only when executed as a script. The unit tests import `VARIANT_SIZES` from
// this module, and an unconditional top-level run() would silently regenerate
// every variant as a side effect of running the test suite.
const invokedDirectly =
  process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href;
if (invokedDirectly) await run();
export {};
