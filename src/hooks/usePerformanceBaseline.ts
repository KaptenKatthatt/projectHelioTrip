import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  getGraphicsTier,
  getRuntimeDeviceBucket,
  type GraphicsTier,
} from "../lib/graphicsTier";

const WINDOW_MS = 10_000;
const TARGET_FPS_BY_TIER: Record<GraphicsTier, number> = {
  high: 55,
  medium: 45,
  low: 30,
};

/**
 * Emits a one-time runtime baseline snapshot for frame rate after boot.
 * This gives a stable comparison point while tuning graphics tiers.
 */
export const usePerformanceBaseline = (): void => {
  const startedAtRef = useRef<number | null>(null);
  const frameCountRef = useRef(0);
  const longestFrameMsRef = useRef(0);
  const reportedRef = useRef(false);

  useFrame((state, delta) => {
    if (reportedRef.current) return;

    if (startedAtRef.current === null) {
      startedAtRef.current = state.clock.elapsedTime * 1000;
      return;
    }

    frameCountRef.current += 1;
    longestFrameMsRef.current = Math.max(
      longestFrameMsRef.current,
      delta * 1000,
    );

    const nowMs = state.clock.elapsedTime * 1000;
    const elapsedMs = nowMs - startedAtRef.current;
    if (elapsedMs < WINDOW_MS) return;

    const elapsedSec = elapsedMs / 1000;
    const avgFps = frameCountRef.current / elapsedSec;
    const avgFrameMs = 1000 / Math.max(avgFps, 0.0001);

    const tier = getGraphicsTier();
    const targetFps = TARGET_FPS_BY_TIER[tier];

    console.info("HelioTrip performance baseline", {
      metric: "runtime_baseline",
      tier,
      deviceBucket: getRuntimeDeviceBucket(),
      windowMs: Math.round(elapsedMs),
      avgFps: Number(avgFps.toFixed(1)),
      avgFrameMs: Number(avgFrameMs.toFixed(2)),
      longestFrameMs: Number(longestFrameMsRef.current.toFixed(2)),
      targetFps,
      meetsTarget: avgFps >= targetFps,
    });

    reportedRef.current = true;
  });
};
