import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { PerspectiveCamera } from 'three';
import { useIsMobileLayout } from '../hooks/useIsMobileLayout';
import { CAMERA_TRAVEL_TOTAL_DURATION_MS } from './CameraManager';
import { useStore } from '../store/useStore';

/** Shift close-up framing upward on narrow screens (fraction of canvas height). */
const CLOSE_VIEW_VERTICAL_SHIFT = 0.1;

const smoothstep = (t: number): number => t * t * (3 - 2 * t);

/**
 * In mobile portrait, the bottom HUD leaves the planet feeling too low.
 * Applies a projection {@link PerspectiveCamera.setViewOffset} so the planet
 * sits ~10% higher while keeping the orbit pivot on the body (unlike moving
 * `OrbitControls.target`).
 *
 * The offset ramps in over {@link CAMERA_TRAVEL_TOTAL_DURATION_MS} during
 * overview→planet travel so framing does not pop when the spring finishes.
 * Planet→planet travel keeps full offset (no ramp) so the view does not dip.
 *
 * Runs after {@link GlobalZoom} (priority 0) so FOV and offset stay in sync.
 */
export const MobileCloseViewFraming = (): null => {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const isMobileLayout = useIsMobileLayout();
  const activeBody = useStore((s) => s.activeBody);
  const isTraveling = useStore((s) => s.isTraveling);
  const viewMode = useStore((s) => s.viewMode);
  const navigationMode = useStore((s) => s.navigationMode);
  const travelId = useStore((s) => s.travelId);

  /** View offset targets portrait HUD; in landscape it skews projection on wide phones. */
  const portraitCanvas = size.width <= size.height;

  const enabled =
    isMobileLayout &&
    portraitCanvas &&
    activeBody !== null &&
    viewMode === 'close' &&
    navigationMode === 'cinematic';

  const prevTravelIdRef = useRef(travelId);
  const prevFrameArrivedCloseRef = useRef(false);
  const skipRampForThisTravelRef = useRef(false);
  const rampStartRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (!(camera instanceof PerspectiveCamera)) return;
      if (camera.view?.enabled) {
        camera.clearViewOffset();
        camera.aspect = size.width / size.height;
        camera.updateProjectionMatrix();
      }
    };
  }, [camera, size.height, size.width]);

  useFrame(() => {
    if (!(camera instanceof PerspectiveCamera)) return;

    if (!enabled) {
      prevTravelIdRef.current = travelId;
      prevFrameArrivedCloseRef.current = false;
      skipRampForThisTravelRef.current = false;
      rampStartRef.current = null;
      if (camera.view?.enabled) {
        camera.clearViewOffset();
        camera.aspect = size.width / size.height;
        camera.updateProjectionMatrix();
      }
      return;
    }

    const arrivedClose = !isTraveling;
    const travelIdBumped = travelId !== prevTravelIdRef.current;

    if (travelIdBumped) {
      prevTravelIdRef.current = travelId;
      if (isTraveling && prevFrameArrivedCloseRef.current) {
        skipRampForThisTravelRef.current = true;
      } else {
        skipRampForThisTravelRef.current = false;
      }
    }

    if (arrivedClose) {
      skipRampForThisTravelRef.current = false;
    }

    let factor = 1;
    if (!arrivedClose) {
      if (skipRampForThisTravelRef.current) {
        factor = 1;
        rampStartRef.current = null;
      } else {
        if (rampStartRef.current === null) {
          rampStartRef.current = performance.now();
        }
        const u = Math.min(
          1,
          (performance.now() - rampStartRef.current) /
            CAMERA_TRAVEL_TOTAL_DURATION_MS,
        );
        factor = smoothstep(u);
      }
    } else {
      rampStartRef.current = null;
      factor = 1;
    }

    prevFrameArrivedCloseRef.current = arrivedClose;

    const w = size.width;
    const h = size.height;
    const offsetY = CLOSE_VIEW_VERTICAL_SHIFT * h * factor;

    if (offsetY < 1e-4) {
      if (camera.view?.enabled) {
        camera.clearViewOffset();
        camera.aspect = size.width / size.height;
        camera.updateProjectionMatrix();
      }
      return;
    }

    camera.setViewOffset(w, h, 0, offsetY, w, h);
  }, 1);

  return null;
};
