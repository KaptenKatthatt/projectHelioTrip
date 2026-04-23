import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { ComponentRef } from 'react';
import { Vector3 } from 'three';
import { useStore } from '../store/useStore';
import { getBodyRadius, getBodyWorldPosition } from '../lib/bodies';
import { getStarWarsBody } from '../lib/starWarsSystems';

const MIN_DISTANCE_MULTIPLIER = 1.2;
const MAX_DISTANCE_MULTIPLIER = 60;
const DAMPING_FACTOR = 0.08;

type OrbitControlsRef = ComponentRef<typeof OrbitControls>;

export const PlanetOrbitControls = () => {
  const camera = useThree((s) => s.camera);
  const activeBody = useStore((s) => s.activeBody);
  const selectedUniversePreset = useStore((s) => s.selectedUniversePreset);
  const selectedStarWarsBody = useStore((s) => s.selectedStarWarsBody);
  const isTraveling = useStore((s) => s.isTraveling);
  const viewMode = useStore((s) => s.viewMode);
  const navigationMode = useStore((s) => s.navigationMode);

  const controlsRef = useRef<OrbitControlsRef>(null);
  const initializedRef = useRef(false);
  const tmpTarget = useMemo(() => new Vector3(), []);
  const tmpDelta = useMemo(() => new Vector3(), []);

  const targetingSolarBody = selectedUniversePreset === 'solarSystem' && activeBody !== null;
  const targetingStarWarsBody =
    selectedUniversePreset === 'starWars' && selectedStarWarsBody !== null;

  const enabled =
    !isTraveling &&
    (targetingSolarBody || targetingStarWarsBody) &&
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
  }, [activeBody, selectedStarWarsBody, enabled]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const radius =
      targetingSolarBody && activeBody
        ? (getBodyRadius(activeBody) ?? 1)
        : targetingStarWarsBody && selectedStarWarsBody
          ? (getStarWarsBody(selectedStarWarsBody)?.radius ?? 1)
          : 1;
    controls.minDistance = Math.max(radius * MIN_DISTANCE_MULTIPLIER, 0.1);
    controls.maxDistance = radius * MAX_DISTANCE_MULTIPLIER;
  }, [
    activeBody,
    selectedStarWarsBody,
    targetingSolarBody,
    targetingStarWarsBody,
  ]);

  /**
   * Priority -2 runs BEFORE drei's OrbitControls internal useFrame
   * (priority -1). On the first frame after arrival we must set
   * `controls.target` to the body's world position before drei calls
   * `controls.update()`, otherwise drei reads the default `target =
   * (0,0,0)`, recomputes the spherical offset from the origin, and
   * snaps `camera.lookAt(target)` toward the Sun — which makes the
   * freshly-arrived camera appear to jump away from the planet.
   */
  useFrame(() => {
    if (!enabled) return;
    const controls = controlsRef.current;
    if (!controls) return;

    if (targetingSolarBody && activeBody) {
      getBodyWorldPosition(activeBody, tmpTarget);
    } else if (targetingStarWarsBody && selectedStarWarsBody) {
      const body = getStarWarsBody(selectedStarWarsBody);
      if (!body) return;
      tmpTarget.set(...body.position);
    } else {
      return;
    }

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
