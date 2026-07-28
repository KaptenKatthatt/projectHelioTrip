import { describe, expect, it } from 'vitest';
import {
  BAD_WINDOWS_TO_ACT,
  COOLDOWN_WINDOWS,
  GOOD_WINDOWS_TO_ACT,
  NATIVE_FRAME_MS_MAX,
  NATIVE_FRAME_MS_MIN,
  clampNativeFrameMs,
  createAdaptiveState,
  decideQualityChange,
  refineNativeFrameMs,
  type AdaptiveState,
  type FrameWindowStats,
} from './adaptiveQuality';

const NATIVE = 16.7;

const window = (p90FrameMs: number, nativeFrameMs = NATIVE): FrameWindowStats => ({
  sampleCount: 120,
  p50FrameMs: Math.min(p90FrameMs, nativeFrameMs),
  p90FrameMs,
  nativeFrameMs,
});

const GOOD = window(17);
const BAD = window(26);
const CATASTROPHIC = window(90);

/** Feeds a sequence of windows and returns the state plus what it decided. */
const run = (state: AdaptiveState, windows: readonly FrameWindowStats[]) => {
  const decisions = [];
  let current = state;
  for (const w of windows) {
    const result = decideQualityChange(current, w);
    current = result.next;
    decisions.push(result.decision);
  }
  return { state: current, decisions };
};

const repeat = (w: FrameWindowStats, n: number) => Array.from({ length: n }, () => w);

describe('decideQualityChange', () => {
  it('ignores a window that collected a single frame', () => {
    const { decision } = decideQualityChange(createAdaptiveState(2), {
      ...BAD,
      sampleCount: 1,
    });
    expect(decision.kind).toBe('hold');
  });

  /**
   * Two frames in a two-second window is one frame per second. Withholding
   * judgement for want of samples is how earlier drafts ignored the worst
   * machines entirely.
   */
  it('acts on a window so sparse it proves the machine is drowning', () => {
    const drowning = { sampleCount: 2, p50FrameMs: 480, p90FrameMs: 500, nativeFrameMs: 16.7 };
    const { decisions } = run(createAdaptiveState(0), [drowning, drowning]);

    // Frames this slow trip the panic path, so it acts on the first window
    // rather than waiting for a second.
    expect(decisions[0]).toEqual({ kind: 'dpr', dprStep: 1, reason: 'slow' });
  });

  /**
   * A machine at five frames a second yields about ten samples per window.
   * That is the case the controller most needs to act on, so it must not be
   * dismissed as too small a sample.
   */
  it('still acts on the sparse windows a slow machine produces', () => {
    const sparseBad = { ...BAD, sampleCount: 10 };
    const { decisions } = run(createAdaptiveState(2), [sparseBad, sparseBad]);

    expect(decisions.at(-1)?.kind).toBe('dpr');
  });

  it('holds after a single bad window', () => {
    const { decision } = decideQualityChange(createAdaptiveState(2), BAD);
    expect(decision.kind).toBe('hold');
  });

  it('trims resolution before quality when frames are slow', () => {
    const { decisions } = run(createAdaptiveState(2), repeat(BAD, BAD_WINDOWS_TO_ACT));
    const acted = decisions.at(-1);

    expect(acted).toEqual({ kind: 'dpr', dprStep: 1, reason: 'slow' });
  });

  it('drops a level only once resolution has bottomed out', () => {
    let state = createAdaptiveState(2);
    const seen: string[] = [];
    for (let i = 0; i < 40; i++) {
      const { decision, next } = decideQualityChange(state, BAD);
      state = next;
      if (decision.kind !== 'hold') seen.push(`${decision.kind}:${'dprStep' in decision ? decision.dprStep : decision.level}`);
    }
    expect(seen.slice(0, 3)).toEqual(['dpr:1', 'dpr:2', 'level:3']);
  });

  /** The failure mode this whole design exists to avoid. */
  it('never changes anything when good and bad windows alternate', () => {
    const alternating = Array.from({ length: 50 }, (_, i) => (i % 2 === 0 ? GOOD : BAD));
    const { decisions, state } = run(createAdaptiveState(2), alternating);

    expect(decisions.every((d) => d.kind === 'hold')).toBe(true);
    expect(state.level).toBe(2);
    expect(state.dprStep).toBe(0);
  });

  it('requires the full run of comfortable windows before upgrading', () => {
    const justShort = run(createAdaptiveState(2), repeat(GOOD, GOOD_WINDOWS_TO_ACT - 1));
    expect(justShort.decisions.every((d) => d.kind === 'hold')).toBe(true);

    const enough = run(createAdaptiveState(2), repeat(GOOD, GOOD_WINDOWS_TO_ACT));
    expect(enough.decisions.at(-1)).toEqual({ kind: 'level', level: 1, reason: 'headroom' });
  });

  it('stays silent for the whole cooldown after a change', () => {
    const upgraded = run(createAdaptiveState(2), repeat(GOOD, GOOD_WINDOWS_TO_ACT));
    const during = run(upgraded.state, repeat(BAD, COOLDOWN_WINDOWS));

    expect(during.decisions.every((d) => d.kind === 'hold')).toBe(true);
  });

  it('reverts a failed upgrade and never retries that level', () => {
    const upgraded = run(createAdaptiveState(2), repeat(GOOD, GOOD_WINDOWS_TO_ACT));
    expect(upgraded.state.level).toBe(1);

    // Sit out the cooldown, then hand it one bad window while on probation.
    const settled = run(upgraded.state, repeat(GOOD, COOLDOWN_WINDOWS));
    const reverted = run(settled.state, [BAD]);

    expect(reverted.decisions.at(-1)).toEqual({
      kind: 'level',
      level: 2,
      reason: 'probation-revert',
    });
    expect(reverted.state.floorLevel).toBe(2);

    const forever = run(reverted.state, repeat(GOOD, 1000));
    expect(forever.decisions.every((d) => d.kind !== 'level')).toBe(true);
    expect(forever.state.level).toBe(2);
  });

  it('drops immediately on a catastrophic window, but only one rung', () => {
    const { decisions, state } = run(createAdaptiveState(2), [CATASTROPHIC]);

    expect(decisions.at(-1)).toEqual({ kind: 'dpr', dprStep: 1, reason: 'slow' });
    expect(state.level).toBe(2);
  });

  it('will not go below the floor level', () => {
    const state = createAdaptiveState(2, 0, 2);
    const { decisions } = run(state, repeat(GOOD, GOOD_WINDOWS_TO_ACT * 3));

    expect(decisions.every((d) => d.kind !== 'level')).toBe(true);
  });

  /**
   * The same absolute frame time is healthy on a 60Hz panel and terrible on a
   * 120Hz one. This is the test that proves the thresholds are relative.
   */
  describe('refresh-rate independence', () => {
    it('treats 9ms as comfortable on both a 120Hz and a 60Hz display', () => {
      expect(decideQualityChange(createAdaptiveState(2), window(9, 8.3)).decision.kind).toBe(
        'hold',
      );
      expect(decideQualityChange(createAdaptiveState(2), window(9, 16.7)).decision.kind).toBe(
        'hold',
      );
    });

    it('treats 16ms as slow on a 120Hz display', () => {
      const { decisions } = run(
        createAdaptiveState(2),
        repeat(window(16, 8.3), BAD_WINDOWS_TO_ACT),
      );
      expect(decisions.at(-1)?.kind).toBe('dpr');
    });

    it('treats the same 16ms as fine on a 60Hz display', () => {
      const { decisions } = run(
        createAdaptiveState(2),
        repeat(window(16, 16.7), BAD_WINDOWS_TO_ACT),
      );
      expect(decisions.every((d) => d.kind === 'hold')).toBe(true);
    });
  });
});

/**
 * The refresh interval is inferred, not reported, and every threshold is a
 * multiple of it — so an estimator that drifts low does not degrade the
 * controller gracefully, it inverts it. These are the tests that keep a
 * healthy machine healthy.
 */
describe('learning the display refresh interval', () => {
  /**
   * One window of a 60Hz panel as rAF actually delivers it: mostly 16.7ms,
   * with the occasional short frame paired against a long one. Sorted, because
   * that is how the caller hands it over.
   */
  const jittery60HzWindow = (): number[] => {
    const frames: number[] = [];
    for (let i = 0; i < 120; i += 1) {
      if (i % 20 === 0) frames.push(8.4);
      else if (i % 20 === 1) frames.push(25.0);
      else frames.push(16.7);
    }
    return frames.sort((a, b) => a - b);
  };

  it('is not dragged down by the short frames in a healthy 60Hz window', () => {
    let native = 16.7;
    for (let i = 0; i < 200; i += 1) {
      native = refineNativeFrameMs(native, jittery60HzWindow());
    }

    // 5% of 120 frames is index 6; the six fastest are the 8.4ms outliers, so
    // the estimate must read the 16.7ms that follows them.
    expect(native).toBeGreaterThan(16);
    expect(clampNativeFrameMs(native)).toBeGreaterThan(16);
  });

  it('still finds a genuine 120Hz display', () => {
    const window120 = new Array(120).fill(8.3);
    let native = 16.7;
    for (let i = 0; i < 60; i += 1) native = refineNativeFrameMs(native, window120);

    expect(clampNativeFrameMs(native)).toBeLessThan(9);
  });

  it('never moves upward, so a slow scene cannot redefine the refresh rate', () => {
    const slow = new Array(120).fill(40);
    expect(refineNativeFrameMs(16.7, slow)).toBe(16.7);
  });

  it('ignores an empty window rather than resetting', () => {
    expect(refineNativeFrameMs(16.7, [])).toBe(16.7);
  });

  it('clamps into the range the thresholds assume', () => {
    expect(clampNativeFrameMs(1)).toBe(NATIVE_FRAME_MS_MIN);
    expect(clampNativeFrameMs(120)).toBe(NATIVE_FRAME_MS_MAX);
  });

  /**
   * The end-to-end statement of the bug: a 60Hz machine comfortably holding
   * vsync for an hour must still be sitting at the level it started on. Before
   * the estimator read whole windows, the accumulated drift pushed the "bad"
   * threshold below 16.7ms and the controller walked such a machine to the
   * bottom rung.
   */
  it('leaves a comfortable 60Hz machine where it started after a long session', () => {
    let native = 16.7;
    let state = createAdaptiveState(0);
    const downgrades: string[] = [];

    for (let i = 0; i < 200; i += 1) {
      native = refineNativeFrameMs(native, jittery60HzWindow());
      const result = decideQualityChange(state, {
        sampleCount: 120,
        p50FrameMs: 16.7,
        p90FrameMs: 16.7,
        nativeFrameMs: clampNativeFrameMs(native),
      });
      if (result.decision.kind !== 'hold' && result.decision.reason === 'slow') {
        downgrades.push(result.decision.kind);
      }
      state = result.next;
    }

    expect(downgrades).toEqual([]);
    expect(state.level).toBe(0);
    expect(state.dprStep).toBe(0);
  });
});
