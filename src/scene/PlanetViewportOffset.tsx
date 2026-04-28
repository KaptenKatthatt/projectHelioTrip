/**
 * WHAT THIS FILE DOES
 * ===================
 * Shifts the planet upward in the 2D viewport on narrow mobile screens.
 *
 * HOW
 * ---
 * Uses camera.setViewOffset() — a projection-matrix trick that does NOT move
 * the camera in 3D space. It makes Three.js render as if the canvas were
 * PLANET_VIEWPORT_UPSHIFT_FRACTION * canvasHeight pixels below the real canvas,
 * which pushes the planet up without disturbing OrbitControls.
 *
 * WHEN TO CHANGE THIS
 * -------------------
 * - Planet feels too low on mobile portrait:  increase PLANET_VIEWPORT_UPSHIFT_FRACTION.
 * - Planet feels too high:                    decrease it (min 0 = no shift).
 * - Has no effect on desktop or landscape:    see the `enabled` guard below.
 *
 * RELATED
 * -------
 * - 3D camera height above the planet in world space: computePlanetEndPos() in
 *   cameraTravel.ts (the PLANET_CAMERA_HEIGHT constant). Affects all platforms.
 * - CSS canvas shift in overview mode: MobileViewOffset.tsx (translateY trick).
 *   That component deliberately avoids setViewOffset to prevent conflicts.
 */

import { useFrame, useThree } from '@react-three/fiber';
import { type MutableRefObject, useEffect, useRef } from 'react';
import { PerspectiveCamera } from 'three';
import { useCloseCinematicBodyEnabled } from '../hooks/useCloseCinematicBodyEnabled';
import { useIsMobileLayout } from '../hooks/useIsMobileLayout';
import { useStore } from '../store/useStore';
import { cameraTravelSpringProgressRef } from './cameraTravelSpringProgress';

/** Fraction of canvas height to shift the planet upward in the 2D viewport. */
const PLANET_VIEWPORT_UPSHIFT_FRACTION = 0.1;

const smoothstep = (t: number): number => t * t * (3 - 2 * t);
const clearCameraViewOffset = (
  camera: PerspectiveCamera,
  width: number,
  height: number,
): void => {
  if (!camera.view?.enabled) return;
  camera.clearViewOffset();
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
};

const resolveOffsetFactor = (
  arrivedClose: boolean,
  skipRampForTravel: boolean,
): number => {
  if (arrivedClose || skipRampForTravel) return 1;
  const progress = cameraTravelSpringProgressRef.current ?? 0;
  return smoothstep(progress);
};

const trackTravelTransition = (
  travelId: number,
  isTraveling: boolean,
  prevTravelIdRef: MutableRefObject<number>,
  prevFrameArrivedCloseRef: MutableRefObject<boolean>,
  skipRampForThisTravelRef: MutableRefObject<boolean>,
): void => {
  const travelIdBumped = travelId !== prevTravelIdRef.current;
  if (!travelIdBumped) return;
  prevTravelIdRef.current = travelId;
  skipRampForThisTravelRef.current =
    isTraveling && prevFrameArrivedCloseRef.current;
};

const updatePreSheetCanvas = (
  canShowPlanetInfo: boolean,
  sheetOpen: boolean,
  width: number,
  height: number,
  preSheetCanvasRef: MutableRefObject<{ w: number; h: number } | null>,
): void => {
  if (!canShowPlanetInfo) {
    preSheetCanvasRef.current = null;
    return;
  }
  if (!sheetOpen) preSheetCanvasRef.current = { w: width, h: height };
};

/**
 * In mobile portrait, the bottom HUD leaves the planet feeling too low.
 * Applies a projection {@link PerspectiveCamera.setViewOffset} so the planet
 * sits higher while keeping the orbit pivot on the body (unlike moving
 * `OrbitControls.target`).
 *
 * The offset ramps with the same spring progress as {@link CameraManager}
 * so framing stays aligned when travel finishes (wall-clock ramps caused a
 * visible jump when `isTraveling` flipped before/after the spring).
 * Planet→planet travel keeps full offset (no ramp) so the view does not dip.
 *
 * Runs after {@link GlobalZoom} (priority 0) so FOV and offset stay in sync.
 */
export const PlanetViewportOffset = (): null => {
  const get = useThree((s) => s.get);
  const size = useThree((s) => s.size);
  const isMobileLayout = useIsMobileLayout();
  const activeBody = useStore((s) => s.activeBody);
  const isTraveling = useStore((s) => s.isTraveling);
  const travelId = useStore((s) => s.travelId);
  const closeCinematicEnabled = useCloseCinematicBodyEnabled(activeBody !== null);

  /** View offset targets portrait HUD; in landscape it skews projection on wide phones. */
  const portraitCanvas = size.width <= size.height;

  const enabled =
    isMobileLayout &&
    portraitCanvas &&
    closeCinematicEnabled;

  const prevTravelIdRef = useRef(travelId);
  const prevFrameArrivedCloseRef = useRef(false);
  const skipRampForThisTravelRef = useRef(false);
  /** Canvas size captured while planet info *can* show but sheet is still closed (avoids offset jump when sheet opens and h shrinks). */
  const preSheetCanvasRef = useRef<{ w: number; h: number } | null>(null);

  useEffect(() => {
    return () => {
      const { camera, size: currentSize } = get();
      if (!(camera instanceof PerspectiveCamera)) return;
      clearCameraViewOffset(camera, currentSize.width, currentSize.height);
    };
  }, [get]);

  useFrame(() => {
    const camera = get().camera;
    if (!(camera instanceof PerspectiveCamera)) return;

    const width = size.width;
    const height = size.height;

    if (!enabled) {
      preSheetCanvasRef.current = null;
      prevTravelIdRef.current = travelId;
      prevFrameArrivedCloseRef.current = false;
      skipRampForThisTravelRef.current = false;
      clearCameraViewOffset(camera, width, height);
      return;
    }

    const arrivedClose = !isTraveling;
    trackTravelTransition(
      travelId,
      isTraveling,
      prevTravelIdRef,
      prevFrameArrivedCloseRef,
      skipRampForThisTravelRef,
    );
    if (arrivedClose) {
      skipRampForThisTravelRef.current = false;
    }

    const factor = resolveOffsetFactor(
      arrivedClose,
      skipRampForThisTravelRef.current,
    );
    prevFrameArrivedCloseRef.current = arrivedClose;

    const sheetOpen = useStore.getState().mobilePlanetInfoSheetOpen;
    const canShowPlanetInfo = activeBody !== null && closeCinematicEnabled;
    updatePreSheetCanvas(
      canShowPlanetInfo,
      sheetOpen,
      width,
      height,
      preSheetCanvasRef,
    );

    const offsetBaseH =
      sheetOpen && preSheetCanvasRef.current !== null
        ? preSheetCanvasRef.current.h
        : height;
    const offsetY = PLANET_VIEWPORT_UPSHIFT_FRACTION * offsetBaseH * factor;

    if (offsetY < 1e-4) {
      clearCameraViewOffset(camera, width, height);
      return;
    }

    camera.setViewOffset(width, height, 0, offsetY, width, height);
  }, 1);

  return null;
};
