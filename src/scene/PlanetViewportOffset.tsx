/**
 * WHAT THIS FILE DOES
 * ===================
 * Adjusts the planet's 2D position in the viewport to prevent overlap with HUD panels.
 * Uses a different strategy per layout tier:
 *
 *  - compact (mobile portrait): shifts the planet upward so it clears the bottom sheet.
 *  - medium  (tablet):          shifts the planet leftward so it clears the side panel.
 *  - expanded (desktop):        shifts the planet leftward (smaller amount) for the side panel.
 *
 * HOW
 * ---
 * Uses camera.setViewOffset() — a projection-matrix trick that does NOT move
 * the camera in 3D space. Three.js renders as if the canvas were offset by the
 * given amount, which repositions the planet without disturbing OrbitControls.
 *
 * WHEN TO CHANGE THIS
 * -------------------
 * - Planet too low on mobile portrait:  increase PLANET_VIEWPORT_UPSHIFT_FRACTION.
 * - Planet too far right on tablet:     increase the 0.40 multiplier in the medium branch.
 * - Planet too far right on desktop:    increase the 0.24 multiplier in the expanded branch.
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
import { useStore } from '../store/useStore';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { cameraTravelSpringProgressRef } from './cameraTravelSpringProgress';

/** Fraction of canvas height to shift the planet upward in the 2D viewport. */
const PLANET_VIEWPORT_UPSHIFT_FRACTION = 0.2;

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
 * In tablet/desktop landscape, the side HUD panel covers the right side.
 * Applies a projection {@link PerspectiveCamera.setViewOffset} so the planet
 * sits higher on mobile portrait and shifts to the left on tablet/desktop,
 * while keeping the orbit pivot on the body (unlike moving `OrbitControls.target`).
 *
 * The offset ramps with the same spring progress as {@link CameraManager}
 * so framing stays aligned when travel finishes.
 * Planet→planet travel keeps full offset (no ramp) so the view does not dip or jump.
 */
export const PlanetViewportOffset = (): null => {
  const get = useThree((s) => s.get);
  const size = useThree((s) => s.size);
  const layoutTier = useResponsiveLayout();
  const activeBody = useStore((s) => s.activeBody);
  const isTraveling = useStore((s) => s.isTraveling);
  const travelId = useStore((s) => s.travelId);
  const viewMode = useStore((s) => s.viewMode);
  const navigationMode = useStore((s) => s.navigationMode);

  /** View offset targets portrait HUD on mobile; in landscape it skews projection on wide phones. */
  const portraitCanvas = size.width <= size.height;

  const enabled =
    activeBody !== null &&
    viewMode === 'close' &&
    navigationMode === 'cinematic';

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

    let offsetX = 0;
    let offsetY = 0;

    if (layoutTier === 'compact') {
      if (portraitCanvas) {
        const sheetOpen = useStore.getState().mobilePlanetInfoSheetOpen;
        const canShowPlanetInfo =
          activeBody !== null &&
          viewMode === 'close' &&
          navigationMode === 'cinematic' &&
          !isTraveling;
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
        offsetY = PLANET_VIEWPORT_UPSHIFT_FRACTION * offsetBaseH * factor;
      }
    } else if (layoutTier === 'medium') {
      // Tablet: shift planet 20% to the left of center (setViewOffset needs 2× the visual fraction).
      offsetX = 0.40 * width * factor;
    } else {
      // Desktop: shift planet 12% to the left of center (smaller amount; narrower side panel).
      offsetX = 0.24 * width * factor;
    }

    if (offsetX < 1e-4 && offsetY < 1e-4) {
      clearCameraViewOffset(camera, width, height);
      return;
    }

    const fullWidth = width + offsetX;
    const fullHeight = height + offsetY;
    camera.setViewOffset(fullWidth, fullHeight, offsetX, offsetY, width, height);
  }, 1);

  return null;
};
