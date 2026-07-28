import type { QualityLevel } from './qualityLevels';

/**
 * A first guess at what this machine can render, so the opening seconds are
 * not spent at a level the adaptive controller is about to abandon.
 *
 * The old heuristic asked only whether the pointer was coarse, which meant
 * every desktop — including one on integrated graphics from 2015 — started at
 * maximum quality.
 */

export type GpuClass = 'software' | 'weak' | 'mid' | 'strong' | 'unknown';

/** Pure, so it can be tested against real renderer strings without a DOM. */
export const classifyRendererString = (renderer: string | null): GpuClass => {
  if (!renderer) return 'unknown';
  const text = renderer.toLowerCase();

  // Order matters. Software first — a SwiftShader string can also mention a
  // vendor. Apple before PowerVR, since Apple GPUs report that lineage.
  if (
    /swiftshader|llvmpipe|softpipe|microsoft basic render|mesa offscreen|virgl|software rasterizer/.test(
      text,
    )
  ) {
    return 'software';
  }

  if (/\brtx\b|geforce rtx|radeon rx [6-9]\d{3}|apple m[1-9]|intel.*\barc\b/.test(text)) {
    return 'strong';
  }

  /**
   * Iris Xe lands here rather than in `strong`: it is still integrated
   * graphics sharing system memory, and over-serving exactly that class of
   * machine is what this work exists to stop. The controller can promote it
   * within seconds if the frames say otherwise.
   */
  if (
    /geforce (gtx )?(9|10|16)\d{2}|radeon rx [45]\d{2}|adreno \(tm\) 6\d{2}|mali-g7[1-9]|iris[^a-z]*xe|\biris\b/.test(
      text,
    )
  ) {
    return 'mid';
  }

  if (
    /hd graphics (2000|2500|3000|4000|4[24-6]00|5\d{2}|6[0-5]\d)|uhd graphics 6\d{2}|\bgma\b/.test(
      text,
    ) ||
    /mali-(4\d{2}|t\d{3}|g3\d|g5[0-7])/.test(text) ||
    /adreno \(tm\) [1-5]\d{2}/.test(text) ||
    /powervr/.test(text) ||
    /geforce (8|9)\d{2}\b|geforce gt \d|geforce gtx [4-7]\d{2}\b|quadro (k|nvs)|radeon (hd|r5|r7 2)/.test(
      text,
    )
  ) {
    return 'weak';
  }

  return 'unknown';
};

export type GpuProbeResult = {
  readonly renderer: string | null;
  readonly gpuClass: GpuClass;
};

/**
 * Touches the DOM exactly once and never throws. The string is unavailable
 * under Firefox's resistFingerprinting and some Brave and Tor configurations,
 * and Safari reports a generic "Apple GPU" — all of which fall through to
 * `unknown` rather than failing.
 */
export const probeGpu = (): GpuProbeResult => {
  if (typeof document === 'undefined') return { renderer: null, gpuClass: 'unknown' };

  let canvas: HTMLCanvasElement | null = null;
  try {
    canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl2') ??
      canvas.getContext('webgl')) as WebGLRenderingContext | null;
    if (!gl) return { renderer: null, gpuClass: 'unknown' };

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = debugInfo
      ? (gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string | null)
      : null;

    /**
     * Browsers cap live WebGL contexts at around sixteen and silently kill the
     * oldest when the cap is hit. Leaking this throwaway context could take
     * the main scene down with it.
     */
    gl.getExtension('WEBGL_lose_context')?.loseContext();

    return { renderer, gpuClass: classifyRendererString(renderer) };
  } catch {
    return { renderer: null, gpuClass: 'unknown' };
  } finally {
    canvas = null;
  }
};

/**
 * `unknown` on a desktop starts at the best level rather than a cautious one:
 * geometry, effects and textures all arrive at full quality immediately, and
 * only sharpness is held back a step while the controller makes up its mind.
 * That buys roughly 1.8x of fill headroom on a weak machine without giving
 * anything up on a capable one.
 */
export const seedLevelForGpu = (
  gpuClass: GpuClass,
  isTouchLike: boolean,
  heuristicLevel: QualityLevel,
): { readonly level: QualityLevel; readonly dprStep: 0 | 1 | 2 } => {
  switch (gpuClass) {
    case 'software':
      return { level: 4, dprStep: 0 };
    case 'weak':
      return isTouchLike ? { level: 3, dprStep: 0 } : { level: 2, dprStep: 0 };
    case 'mid':
      return isTouchLike ? { level: 2, dprStep: 0 } : { level: 1, dprStep: 0 };
    case 'strong':
      return isTouchLike ? { level: 1, dprStep: 0 } : { level: 0, dprStep: 0 };
    default:
      return isTouchLike
        ? { level: heuristicLevel, dprStep: 0 }
        : { level: heuristicLevel, dprStep: 1 };
  }
};
