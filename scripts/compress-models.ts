import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(import.meta.url), '..', '..');
const PUBLIC_DIR = resolve(ROOT, 'public');
// Direct .bin paths instead of npx: no per-call resolution overhead, and
// the pinned devDependency versions always run (npx could pick up a
// globally installed variant with different quantization behavior).
const GLTF_TRANSFORM_BIN = resolve(ROOT, 'node_modules', '.bin', 'gltf-transform');
const GLTFPACK_BIN = resolve(ROOT, 'node_modules', '.bin', 'gltfpack');

/**
 * GLB models shipped to the app. The originals stay in git as authoring
 * sources (deploy-excluded via .vercelignore); the app loads the
 * `.meshopt.glb` outputs emitted here. New name on new content keeps the
 * repo's rename-on-change convention for immutable-cached assets.
 *
 * Why meshopt instead of the Draco compression three of the sources use:
 * the Draco WASM decoder is fetched from a Google CDN at runtime, so the
 * models break offline and behind blocked CDNs; the meshopt decoder ships
 * inside the app bundle. Pipeline per model: gltf-transform decodes any
 * Draco geometry, then gltfpack re-compresses with meshopt at higher
 * quantization precision (16/14/12 bits) than the Draco sources used, so
 * geometry fidelity is not reduced. Embedded textures pass through
 * byte-identical (no -tc).
 */
const MODELS: readonly string[] = [
  'Mars 2020 Perseverance Rover.glb',
  'Apollo Lunar Module.glb',
  'sputnik_cleaned.glb',
  'International_Space_Station_(ISS)_(A).glb',
];

const toMeshoptPath = (glb: string): string =>
  glb.replace(/\.glb$/, '.meshopt.glb');

const kb = (path: string): string => (statSync(path).size / 1024).toFixed(0);

const main = (): void => {
  const workDir = mkdtempSync(join(tmpdir(), 'heliotrip-models-'));
  try {
    for (const name of MODELS) {
      const input = resolve(PUBLIC_DIR, name);
      const output = resolve(PUBLIC_DIR, toMeshoptPath(name));
      if (!existsSync(input)) {
        console.error(`fail   ${name}: source model not found`);
        process.exitCode = 1;
        continue;
      }
      if (existsSync(output)) {
        console.log(`skip   ${toMeshoptPath(name)} (already present)`);
        continue;
      }
      const decoded = join(workDir, 'decoded.glb');
      // stderr is inherited so the tools' own diagnostics (unsupported
      // extension, bad geometry, quantization warnings) reach the console
      // instead of dying unread inside a captured buffer.
      const stdio: Array<'ignore' | 'inherit'> = ['ignore', 'ignore', 'inherit'];
      execFileSync(GLTF_TRANSFORM_BIN, ['copy', input, decoded], { stdio });
      execFileSync(
        GLTFPACK_BIN,
        [
          '-i', decoded,
          '-o', output,
          '-cc',
          '-vp', '16',
          '-vt', '14',
          '-vn', '12',
          '-kn',
          '-ke',
          '-ac',
        ],
        { stdio },
      );
      console.log(
        `ok     ${toMeshoptPath(name)} (${kb(input)} -> ${kb(output)} KB)`,
      );
    }
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
};

main();
