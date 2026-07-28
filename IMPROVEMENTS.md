# Improvement Backlog

Ideas evaluated but deliberately deferred. Each entry lists the expected
win, the cost, and why it is parked — so a future decision can be made
quickly without redoing the investigation.

## KTX2 / Basis Universal GPU textures (parked: owner wants to review)

**What it is.** Today the planet/moon textures ship as WebP. The GPU cannot
sample WebP directly, so three.js decodes each texture to raw RGBA in VRAM:
a 2k diffuse map costs ~16-21MB of GPU memory regardless of its file size,
and decode/upload happens on the main thread during scene warmup. KTX2
(Basis Universal supercompression, UASTC or ETC1S) is a GPU-native format:
textures stay compressed in VRAM and upload without a decode step.

**Expected wins.**
- 4-6x lower GPU memory for textures (biggest effect on mobile/iPad, where
  VRAM pressure causes tab reloads and thermal throttling).
- Faster texture upload during scene warmup; less main-thread jank on the
  tier-based idle preloads (`texturePreload.ts`).
- File sizes comparable to or smaller than the current WebP set.

**The quality caveat (why this is parked).** KTX2 transcoding is not
lossless: UASTC is near-lossless (visually indistinguishable in practice,
measurable in a pixel diff), ETC1S is clearly lossier (visible banding risk
on smooth gradients like gas-giant bands). Owner constraint: texture
quality must not degrade. If this is picked up, use **UASTC** only, and
verify with side-by-side screenshot comparison of the worst cases (Jupiter
bands, Earth clouds, Saturn rings) before committing.

**Implementation sketch (roughly one day).**
1. Add a `textures:ktx2` script using `toktx` or `basisu` (UASTC mode,
   `--uastc_quality 4`, zstd supercompression) emitting `.ktx2` siblings
   next to the existing `.webp` files (which stay in git as sources).
2. Wire `KTX2Loader` (three-stdlib) + a WASM transcoder into the texture
   path in `src/lib/textures.ts`; drei's `useTexture` needs replacing with
   `useLoader(KTX2Loader, ...)` for these URLs. The transcoder WASM must be
   self-hosted in `public/` (same CDN-independence rule as the meshopt
   decision in `scripts/compress-models.ts`).
3. Keep WebP as a runtime fallback for browsers/GPUs without a suitable
   compressed-texture format (rare, but cheap to keep).
4. Update the SW runtime-caching image route to include `.ktx2`.

**Decision needed from owner:** accept "near-lossless" (UASTC) for the
planet textures in exchange for the VRAM/perf wins, or keep byte-exact WebP.

## three.js loads before the scene does (parked: large refactor)

**What it is.** The `useStore` chunk — loaded eagerly at boot, before the
lazy `Scene` chunk is even requested — weighs 765KB (197KB gzipped), and
most of that is three.js itself. It gets there through the data model, not
the renderer: `createSimulationSlice.ts`, `planets.ts`, `moons.ts`,
`bodies.ts` and `kepler.ts` all import `Vector3` (and friends) for
positions and orbital math, and the store imports them all. So every visitor
downloads and parses all of three.js on the critical path of first paint,
including the parse cost on exactly the weak machines the quality ladder
exists for.

**Expected win.** Roughly 197KB gzip off the eager download and the
associated parse/compile time (likely 100-300ms on a weak CPU) moved behind
the scene's lazy boundary, where the loading screen already covers it.

**Why it is parked.** The fix is to stop the eager data model from speaking
in three types — either a local `{x, y, z}` vector type converted at the
scene boundary, or moving the Vector3-producing math into the scene chunk.
That touches the store's public types, every slice, and the orbital-math
call sites at once; it is a coordinated refactor with real regression risk,
not a sweep item. If picked up: `npx vite build` and inspecting which chunk
`WebGLRenderer` lands in is the one-line acceptance test.

## Smaller parked items

- **`.vercelignore` / `SURFACE_TEXTURES` dual lists.** Authoring-source
  exclusions are maintained by hand in two places. Fine at current scale;
  if the asset set grows, move sources into a conventionally-ignored
  directory (e.g. `public/_sources/`) instead of listing files.
- **Draco originals in git.** The `.glb` authoring sources total ~6MB in
  git. If the repo ever needs slimming, they could move to LFS or a
  release attachment; parked because git history already carries them.
