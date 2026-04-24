import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from 'three';
import { INITIAL_OVERVIEW_FOV } from '../lib/initialCamera';
import { useStore } from '../store/useStore';

/**
 * Smooth FOV-based zoom for the overview view. Scrolling the wheel in
 * overview + cinematic mode narrows/widens the camera's field of view,
 * giving an "infinite zoom" feel that is cheaper than repositioning
 * the camera along the line of sight and stacks naturally on top of
 * CameraManager's position animations (we only touch `fov`).
 *
 * When not in overview, the FOV is smoothly lerped back to the default
 * so users never end up stuck with a weird FOV after traveling to a
 * planet.
 *
 * Default matches {@link INITIAL_OVERVIEW_FOV} / Canvas in Scene.
 */
const DEFAULT_FOV = INITIAL_OVERVIEW_FOV;
const MIN_FOV = 15;
const MAX_FOV = 75;
const FOV_WHEEL_STEP = 2;
const FOV_SMOOTHING = 0.001;
/** ~28 px change in pinch span ≈ one mouse-wheel notch (see {@link FOV_WHEEL_STEP}). */
const PINCH_FOV_DEG_PER_PX = FOV_WHEEL_STEP / 28;

const clampFov = (fov: number): number =>
  Math.min(MAX_FOV, Math.max(MIN_FOV, fov));

const touchDistance = (touches: TouchList): number => {
  const a = touches.item(0);
  const b = touches.item(1);
  if (!a || !b) return 0;
  return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
};

export const GlobalZoom = () => {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const viewMode = useStore((s) => s.viewMode);
  const navigationMode = useStore((s) => s.navigationMode);
  const isTraveling = useStore((s) => s.isTraveling);
  const overviewCameraResetId = useStore((s) => s.overviewCameraResetId);

  const targetFovRef = useRef(DEFAULT_FOV);
  const perspectiveCameraRef = useRef<PerspectiveCamera | null>(null);

  const enabled =
    viewMode === 'overview' &&
    navigationMode === 'cinematic' &&
    !isTraveling;

  useEffect(() => {
    perspectiveCameraRef.current =
      camera instanceof PerspectiveCamera ? camera : null;
  }, [camera]);

  useEffect(() => {
    targetFovRef.current = DEFAULT_FOV;
  }, [overviewCameraResetId]);

  useEffect(() => {
    if (!enabled) {
      targetFovRef.current = DEFAULT_FOV;
      return;
    }

    const canvas = gl.domElement;
    const onWheel = (event: WheelEvent): void => {
      event.preventDefault();
      const step = Math.sign(event.deltaY) * FOV_WHEEL_STEP;
      targetFovRef.current = clampFov(targetFovRef.current + step);
    };

    let pinchAnchorSpan = 0;
    let pinchAnchorFov = DEFAULT_FOV;

    const beginPinchIfNeeded = (touches: TouchList): void => {
      if (touches.length !== 2) return;
      pinchAnchorSpan = touchDistance(touches);
      pinchAnchorFov = targetFovRef.current;
    };

    const onTouchStart = (event: TouchEvent): void => {
      beginPinchIfNeeded(event.touches);
    };

    const onTouchMove = (event: TouchEvent): void => {
      if (event.touches.length !== 2) return;
      if (pinchAnchorSpan <= 0) {
        beginPinchIfNeeded(event.touches);
        return;
      }
      event.preventDefault();
      const span = touchDistance(event.touches);
      targetFovRef.current = clampFov(
        pinchAnchorFov + (pinchAnchorSpan - span) * PINCH_FOV_DEG_PER_PX,
      );
    };

    const endPinch = (): void => {
      pinchAnchorSpan = 0;
    };

    const onTouchEnd = (event: TouchEvent): void => {
      if (event.touches.length < 2) endPinch();
    };

    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);
    canvas.addEventListener('touchcancel', onTouchEnd);

    return () => {
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [enabled, gl]);

  useFrame((_, delta) => {
    const perspectiveCamera = perspectiveCameraRef.current;
    if (!perspectiveCamera) return;
    const target = targetFovRef.current;
    const current = perspectiveCamera.fov;
    if (Math.abs(target - current) < 0.01) return;

    const smoothing = 1 - Math.pow(FOV_SMOOTHING, delta);
    perspectiveCamera.fov = current + (target - current) * smoothing;
    perspectiveCamera.updateProjectionMatrix();
  });

  return null;
};
