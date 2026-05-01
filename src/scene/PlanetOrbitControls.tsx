import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei/core/OrbitControls';
import type { ComponentRef } from 'react';
import { Vector3 } from 'three';
import { useCloseCinematicBodyEnabled } from '../hooks/useCloseCinematicBodyEnabled';
import { useIsMobileLayout } from '../hooks/useIsMobileLayout';
import { useStore } from '../store/useStore';
import { getBodyRadius, getBodyWorldPosition } from '../lib/bodies';
import { applyMobilePlanetScreenLift } from './mobilePlanetFraming';

const MIN_DISTANCE_MULTIPLIER = 1.2;
const MAX_DISTANCE_MULTIPLIER = 60;
const DAMPING_FACTOR = 0.08;

type OrbitControlsRef = ComponentRef<typeof OrbitControls>;

export const PlanetOrbitControls = () => {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const activeBody = useStore((s) => s.activeBody);
  const isMobileLayout = useIsMobileLayout();

  const controlsRef = useRef<OrbitControlsRef>(null);
  const initializedRef = useRef(false);
  const tmpTargetRef = useRef(new Vector3());
  const tmpDeltaRef = useRef(new Vector3());

  const enabled = useCloseCinematicBodyEnabled(activeBody !== null);

  /**
   * Re-initialize the orbit anchor whenever the active body changes or we
   * re-enter an enabled state. Without this flag the delta-tracking loop
   * below would apply a huge jump on the first frame (subtracting the old
   * body's position from the new one).
   */
  const prevMobileLayoutRef = useRef(isMobileLayout);
  const prevSizeRef = useRef({ width: size.width, height: size.height });

  useEffect(() => {
    initializedRef.current = false;
  }, [activeBody, enabled]);

  /**
   * Re-initialize the orbit anchor when the layout or window size changes significantly.
   * This prevents the camera from getting squashed or jumping wildly when switching
   * between mobile and desktop views in devtools, or when rotating a device.
   */
  useEffect(() => {
    if (
      prevMobileLayoutRef.current !== isMobileLayout ||
      Math.abs(prevSizeRef.current.width - size.width) > 100 ||
      Math.abs(prevSizeRef.current.height - size.height) > 100
    ) {
      initializedRef.current = false;
      prevMobileLayoutRef.current = isMobileLayout;
      prevSizeRef.current = { width: size.width, height: size.height };
    }
  }, [isMobileLayout, size.width, size.height]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls || !activeBody) return;
    const radius = getBodyRadius(activeBody) ?? 1;
    controls.minDistance = Math.max(radius * MIN_DISTANCE_MULTIPLIER, 0.1);
    controls.maxDistance = radius * MAX_DISTANCE_MULTIPLIER;
  }, [activeBody]);

  /**
   * Priority -2 runs BEFORE OrbitControls' internal `useFrame` update
   * (priority -1). On the first frame after arrival we must set
   * `controls.target` to the body's world position before the controls
   * call `update()`, otherwise the default `target = (0,0,0)` makes the
   * camera appear to jump away from the planet.
   */
  useFrame(() => {
    const tmpTarget = tmpTargetRef.current;
    const tmpDelta = tmpDeltaRef.current;

    if (!enabled || !activeBody) return;
    const controls = controlsRef.current;
    if (!controls) return;

    getBodyWorldPosition(activeBody, tmpTarget);
    // Intentional: orbit target uses the same mobile lift as framing so the
    // selected body stays at the approved on-screen height in close view.
    tmpTarget.y = applyMobilePlanetScreenLift(
      camera,
      camera.position.distanceTo(tmpTarget),
      tmpTarget.y,
      size,
      isMobileLayout,
    );

    if (!initializedRef.current) {
      controls.target.copy(tmpTarget);
      initializedRef.current = true;
    } else {
      tmpDelta.subVectors(tmpTarget, controls.target);
      camera.position.add(tmpDelta);
      controls.target.copy(tmpTarget);
    }
  }, -2);

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={enabled}
      enableDamping
      dampingFactor={DAMPING_FACTOR}
      enablePan={false}
    />
  );
};
