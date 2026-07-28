import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  createAdaptiveState,
  decideQualityChange,
  MIN_SAMPLES,
  type AdaptiveState,
  type FrameWindowStats,
} from '../lib/quality/adaptiveQuality';
import {
  getQualityDprStep,
  getQualityLevel,
  getQualitySource,
  setQualityDprStep,
  setQualityLevel,
  type DprStep,
} from '../lib/quality/qualityStore';
import { writeQualityProfile, buildGpuKey } from '../lib/quality/qualityProfileStorage';
import type { QualityLevel } from '../lib/quality/qualityLevels';
import { useStore } from '../store/useStore';

const WINDOW_MS = 2000;
const WARMUP_MS = 6000;
const RING_SIZE = 256;
/**
 * Clamped rather than discarded. A struggling GPU genuinely produces frames in
 * the hundreds — sometimes thousands — of milliseconds, and a rule that threw
 * those windows away as noise silenced the controller on exactly the hardware
 * it exists to rescue. Backgrounded tabs are already excluded by the
 * `document.hidden` check, so what is left is real.
 */
const OUTLIER_CLAMP_MS = 500;

const STABLE_BEFORE_REMEMBER_MS = 60_000;

type Options = {
  /** The renderer string, so a remembered level is tied to this GPU. */
  readonly renderer: string | null;
  readonly initialFloorLevel?: QualityLevel;
};

/**
 * Watches frame times and trades picture for smoothness when it has to.
 *
 * All the policy lives in `adaptiveQuality.ts`; this only measures, decides
 * when measuring is meaningful, and applies the result.
 */
export const useAdaptiveQuality = ({ renderer, initialFloorLevel = 0 }: Options): void => {
  const stateRef = useRef<AdaptiveState | null>(null);
  const framesRef = useRef(new Float32Array(RING_SIZE));
  const scratchRef = useRef(new Float32Array(RING_SIZE));
  const countRef = useRef(0);
  const cursorRef = useRef(0);
  const windowStartRef = useRef(0);
  const startedAtRef = useRef(0);
  const lastFrameAtRef = useRef(0);
  const nativeFrameMsRef = useRef(16.7);
  const discardWindowRef = useRef(false);
  const signatureRef = useRef('');
  const stableSinceRef = useRef(0);
  const rememberedRef = useRef(false);

  useFrame(() => {
    const now = performance.now();

    if (startedAtRef.current === 0) {
      startedAtRef.current = now;
      windowStartRef.current = now;
      lastFrameAtRef.current = now;
      stateRef.current = createAdaptiveState(
        getQualityLevel(),
        getQualityDprStep(),
        initialFloorLevel,
      );
      return;
    }

    const delta = now - lastFrameAtRef.current;
    lastFrameAtRef.current = now;

    // Shader compilation and the first texture uploads dominate the opening
    // seconds and say nothing about steady-state cost.
    if (now - startedAtRef.current < WARMUP_MS) {
      windowStartRef.current = now;
      return;
    }

    const store = useStore.getState();
    /**
     * Frozen while the scene is doing something transient and expensive, or
     * while the user has pinned a level by hand.
     */
    const frozen =
      getQualitySource() === 'user' ||
      store.isTraveling ||
      store.isLanded ||
      store.isLandedOnMoon ||
      store.marsTransitionState !== 'idle' ||
      store.moonTransitionState !== 'idle' ||
      (typeof document !== 'undefined' && document.hidden);

    if (frozen) {
      countRef.current = 0;
      cursorRef.current = 0;
      windowStartRef.current = now;
      return;
    }

    /**
     * Mounting depth of field or the whole Milky Way changes the cost mid
     * window. Rather than enumerate every case, discard any window the scene
     * changed shape during.
     */
    const signature = `${store.viewMode}|${store.navigationMode}|${store.activeBody}|${store.selectedConstellation}`;
    if (signature !== signatureRef.current) {
      signatureRef.current = signature;
      discardWindowRef.current = true;
    }

    const sample = Math.min(delta, OUTLIER_CLAMP_MS);
    framesRef.current[cursorRef.current] = sample;
    cursorRef.current = (cursorRef.current + 1) % RING_SIZE;
    countRef.current = Math.min(countRef.current + 1, RING_SIZE);

    // The display's own interval, learned from the fastest frames rather than
    // assumed, so the thresholds work at 60, 120 and 144Hz alike.
    if (sample > 1 && sample < nativeFrameMsRef.current) {
      nativeFrameMsRef.current = nativeFrameMsRef.current * 0.9 + sample * 0.1;
    }

    if (now - windowStartRef.current < WINDOW_MS) return;
    windowStartRef.current = now;

    const count = countRef.current;
    countRef.current = 0;
    cursorRef.current = 0;

    if (discardWindowRef.current) {
      discardWindowRef.current = false;
      return;
    }
    if (count < MIN_SAMPLES) return;

    const scratch = scratchRef.current.subarray(0, count);
    scratch.set(framesRef.current.subarray(0, count));
    scratch.sort();

    const stats: FrameWindowStats = {
      sampleCount: count,
      p50FrameMs: scratch[Math.floor(count * 0.5)] ?? 0,
      p90FrameMs: scratch[Math.floor(count * 0.9)] ?? 0,
      nativeFrameMs: Math.min(17.5, Math.max(6.5, nativeFrameMsRef.current)),
    };

    const current = stateRef.current;
    if (!current) return;

    const { decision, next } = decideQualityChange(current, stats);
    stateRef.current = next;

    if (decision.kind === 'dpr') {
      setQualityDprStep(decision.dprStep as DprStep);
      stableSinceRef.current = now;
      console.info('HelioTrip quality change', {
        metric: 'quality_change',
        axis: 'resolution',
        dprStep: decision.dprStep,
        reason: decision.reason,
        p90FrameMs: Number(stats.p90FrameMs.toFixed(2)),
        nativeFrameMs: Number(stats.nativeFrameMs.toFixed(2)),
      });
      return;
    }
    if (decision.kind === 'level') {
      setQualityLevel(decision.level, 'auto');
      stableSinceRef.current = now;
      console.info('HelioTrip quality change', {
        metric: 'quality_change',
        axis: 'level',
        to: decision.level,
        reason: decision.reason,
        p50FrameMs: Number(stats.p50FrameMs.toFixed(2)),
        p90FrameMs: Number(stats.p90FrameMs.toFixed(2)),
        nativeFrameMs: Number(stats.nativeFrameMs.toFixed(2)),
      });
      return;
    }

    /**
     * Remember a level only once it has genuinely held, and only once per
     * session — writing storage on every quiet window would reintroduce the
     * very cost this branch of work removed.
     */
    if (stableSinceRef.current === 0) stableSinceRef.current = now;
    if (!rememberedRef.current && now - stableSinceRef.current >= STABLE_BEFORE_REMEMBER_MS) {
      rememberedRef.current = true;
      writeQualityProfile({
        gpuKey: buildGpuKey(renderer),
        lastStableLevel: next.level,
        lastStableDprStep: next.dprStep,
        failedLevels: next.floorLevel > 0 ? [next.floorLevel] : [],
      });
    }
  });
};
