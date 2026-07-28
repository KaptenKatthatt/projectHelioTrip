import { describe, expect, it } from 'vitest';
import { classifyRendererString, seedLevelForGpu } from './gpuProbe';

/** Real UNMASKED_RENDERER_WEBGL strings, not invented ones. */
const CASES: ReadonlyArray<readonly [string, ReturnType<typeof classifyRendererString>]> = [
  ['ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)', 'software'],
  ['llvmpipe (LLVM 15.0.7, 256 bits)', 'software'],
  ['Microsoft Basic Render Driver', 'software'],

  ['ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11 vs_5_0 ps_5_0, D3D11)', 'weak'],
  ['ANGLE (Intel, Intel(R) HD Graphics 4000 Direct3D11 vs_5_0 ps_5_0, D3D11)', 'weak'],
  ['Mali-G57 MC2', 'weak'],
  ['Mali-T860', 'weak'],
  ['Adreno (TM) 505', 'weak'],
  ['PowerVR Rogue GE8320', 'weak'],
  ['ANGLE (NVIDIA, NVIDIA GeForce GTX 660 Direct3D11 vs_5_0 ps_5_0, D3D11)', 'weak'],

  ['Adreno (TM) 640', 'mid'],
  ['ANGLE (NVIDIA, NVIDIA GeForce GTX 1060 Direct3D11 vs_5_0 ps_5_0, D3D11)', 'mid'],
  ['ANGLE (AMD, AMD Radeon RX 580 Direct3D11 vs_5_0 ps_5_0, D3D11)', 'mid'],
  ['Mali-G78', 'mid'],
  // Integrated, however new — deliberately not classed as strong.
  ['ANGLE (Intel, Intel(R) Iris(R) Xe Graphics Direct3D11 vs_5_0 ps_5_0, D3D11)', 'mid'],

  ['ANGLE (NVIDIA, NVIDIA GeForce RTX 4070 Direct3D11 vs_5_0 ps_5_0, D3D11)', 'strong'],
  ['ANGLE (AMD, AMD Radeon RX 7900 XTX Direct3D11 vs_5_0 ps_5_0, D3D11)', 'strong'],
  ['Apple M2', 'strong'],


  ['Apple GPU', 'unknown'],
  ['WebKit WebGL', 'unknown'],
];

describe('classifyRendererString', () => {
  for (const [renderer, expected] of CASES) {
    it(`classifies ${renderer.slice(0, 48)} as ${expected}`, () => {
      expect(classifyRendererString(renderer)).toBe(expected);
    });
  }

  it('treats a missing string as unknown rather than failing', () => {
    expect(classifyRendererString(null)).toBe('unknown');
    expect(classifyRendererString('')).toBe('unknown');
  });

  /**
   * Apple GPUs historically report PowerVR lineage, so the order of the checks
   * matters — an Apple chip must never fall into the weak bucket.
   */
  it('does not mistake an Apple GPU for PowerVR', () => {
    expect(classifyRendererString('Apple M1 Pro (PowerVR-derived)')).toBe('strong');
  });
});

describe('seedLevelForGpu', () => {
  it('bottoms out on software rendering', () => {
    expect(seedLevelForGpu('software', false, 0).level).toBe(4);
  });

  it('drops a weak desktop off maximum quality, which the old heuristic never did', () => {
    expect(seedLevelForGpu('weak', false, 0).level).toBe(2);
    expect(seedLevelForGpu('weak', true, 3).level).toBe(3);
  });

  it('opens a strong desktop at the best level', () => {
    expect(seedLevelForGpu('strong', false, 0)).toEqual({ level: 0, dprStep: 0 });
  });

  /**
   * An unrecognised desktop keeps every geometry, effect and texture setting
   * at maximum and gives up only a step of sharpness, so a capable machine
   * loses nothing while a weak one still gets breathing room.
   */
  it('keeps an unknown desktop at full quality but trims resolution', () => {
    expect(seedLevelForGpu('unknown', false, 0)).toEqual({ level: 0, dprStep: 1 });
  });

  it('falls back to the device heuristic on an unknown phone', () => {
    expect(seedLevelForGpu('unknown', true, 3)).toEqual({ level: 3, dprStep: 0 });
  });
});
