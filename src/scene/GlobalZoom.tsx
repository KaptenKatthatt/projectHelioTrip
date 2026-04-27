import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from 'three';
import { useIsMobileLayout } from '../hooks/useIsMobileLayout';
import { getConstellationMinFovDegrees } from '../lib/constellationOrientation';
import { INITIAL_OVERVIEW_FOV } from '../lib/initialCamera';
import { getConstellationTargetFovDeg } from '../lib/constellationViewSettings';
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
 *
 * CONSTELLATION ZOOM
 * ------------------
 * When a constellation is selected, two things happen on arrival (when
 * isTraveling → false):
 *   1. If CONSTELLATION_TARGET_FOV_DEG is set in constellationViewSettings.ts,
 *      targetFovRef is set to that value.
 *   2. targetFovRef is clamped so the full figure always fits in view.
 * The user can then scroll/pinch to zoom further from that starting point.
 */
const DEFAULT_FOV = INITIAL_OVERVIEW_FOV;
const MIN_FOV = 15;
/** Wide enough for constellation framing (Orion + view spin can need ~85°+ vertical). */
const MAX_FOV = 92;
const FOV_WHEEL_STEP = 2;
const FOV_SMOOTHING = 0.001;
/** Per-second lerp toward constellation framing FOV so the figure doesn't stay clipped at first paint. */
const FOV_CONSTELLATION_SETTLE_PER_SEC = 14;
/** Portrait phone: extra zoom-out so the figure clears bottom nav and side clipping. */
const CONSTELLATION_MIN_FOV_MOBILE_PORTRAIT = 1.1;
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
  const size = useThree((s) => s.size);
  const gl = useThree((s) => s.gl);
  const viewMode = useStore((s) => s.viewMode);
  const navigationMode = useStore((s) => s.navigationMode);
  const isTraveling = useStore((s) => s.isTraveling);
  const overviewCameraResetId = useStore((s) => s.overviewCameraResetId);
  const selectedConstellation = useStore((s) => s.selectedConstellation);
  const isMobileLayout = useIsMobileLayout();

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

  /**
   * Apply constellation view settings once travel has completed (enabled = true).
   *
   * ORDERING NOTE: the [enabled, gl] effect below resets targetFovRef to DEFAULT_FOV
   * when enabled becomes false (travel starts). This effect runs after that reset
   * (defined later in the file) and re-applies the constellation FOV when enabled
   * becomes true again (travel ends). The sequence is:
   *   travel starts → enabled=false → FOV reset to DEFAULT
   *   travel ends   → enabled=true  → this effect fires: apply target FOV or minF
   *
   * TWO PATHS:
   *   A) CONSTELLATION_TARGET_FOV_DEG is set in constellationViewSettings.ts:
   *      → Use that value directly, clamped only to [MIN_FOV, MAX_FOV].
   *      → No minF enforcement: the user has explicitly chosen the zoom level.
   *      → Small values zoom in tight (may clip the figure edges); large values
   *        zoom out (more sky visible around the figure).
   *   B) No configured FOV:
   *      → Ensure targetFovRef is at least wide enough to show the full figure
   *        (minF with a generous margin built in via FOV_MARGIN in
   *        constellationOrientation.ts). Never zooms in below minF automatically.
   *
   * size.width/height is a dependency so path B stays correct on resize
   * (e.g., phone rotation while viewing a constellation).
   */
  useEffect(() => {
    if (!enabled || !selectedConstellation) return;
    if (!(camera instanceof PerspectiveCamera)) return;

    // Path A: explicit FOV override — applied directly, bypasses minF clamp.
    const configured = getConstellationTargetFovDeg(selectedConstellation);
    if (configured !== null) {
      targetFovRef.current = clampFov(configured);
      return;
    }

    // Path B: no override — ensure the full figure is visible.
    let minF = getConstellationMinFovDegrees(selectedConstellation, camera.aspect);
    if (!Number.isFinite(minF) || minF <= 0) minF = DEFAULT_FOV;
    if (isMobileLayout && camera.aspect > 0 && camera.aspect < 1) {
      minF *= CONSTELLATION_MIN_FOV_MOBILE_PORTRAIT;
    }
    targetFovRef.current = clampFov(Math.max(targetFovRef.current, minF));
  }, [enabled, selectedConstellation, camera, isMobileLayout, size.width, size.height]);

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

    const constellationFraming =
      selectedConstellation &&
      viewMode === 'overview' &&
      navigationMode === 'cinematic';
    const alpha = constellationFraming
      ? Math.min(1, delta * FOV_CONSTELLATION_SETTLE_PER_SEC)
      : 1 - Math.pow(FOV_SMOOTHING, delta);
    perspectiveCamera.fov = current + (target - current) * alpha;
    perspectiveCamera.updateProjectionMatrix();
  });

  return null;
};
