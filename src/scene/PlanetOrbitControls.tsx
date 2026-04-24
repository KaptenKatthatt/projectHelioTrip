import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { ComponentRef } from 'react';
import { Vector3 } from 'three';
import { useStore } from '../store/useStore';
import { getBodyRadius, getBodyWorldPosition } from '../lib/bodies';

const MIN_DISTANCE_MULTIPLIER = 1.2;
const MAX_DISTANCE_MULTIPLIER = 60;
const DAMPING_FACTOR = 0.08;

type OrbitControlsRef = ComponentRef<typeof OrbitControls>;

export const PlanetOrbitControls = () => {
  const camera = useThree((s) => s.camera);
  const activeBody = useStore((s) => s.activeBody);
  const isTraveling = useStore((s) => s.isTraveling);
  const viewMode = useStore((s) => s.viewMode);
  const navigationMode = useStore((s) => s.navigationMode);

  const controlsRef = useRef<OrbitControlsRef>(null);
  const initializedRef = useRef(false);
  const tmpTarget = useMemo(() => new Vector3(), []);
  const tmpDelta = useMemo(() => new Vector3(), []);

  const enabled =
    !isTraveling &&
    activeBody !== null &&
    viewMode === 'close' &&
    navigationMode === 'cinematic';

  /**
   * Re-initialize the orbit anchor whenever the active body changes or we
   * re-enter an enabled state. Without this flag the delta-tracking loop
   * below would apply a huge jump on the first frame (subtracting the old
   * body's position from the new one).
   */
  useEffect(() => {
    initializedRef.current = false;
  }, [activeBody, enabled]);

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
    if (!enabled || !activeBody) return;
    const controls = controlsRef.current;
    if (!controls) return;

    getBodyWorldPosition(activeBody, tmpTarget);

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
