import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { MOONS } from '../lib/moons';
import { PLANETS } from '../lib/planets';
import { getLiveMoonOffset, getLivePosition } from '../lib/positionsBus';
import { useStore } from '../store/useStore';

const WORLD_UP = new Vector3(0, 1, 0);
const INTRO_DURATION_MS = 3000;
const INTRO_MOVE_DISTANCE = 220;
const INTRO_PITCH_RAD = 0.42;
const LOOK_AT_DISTANCE = 100;
const BODY_PADDING = 1.2;
const MIN_SAFE_MOVE_DISTANCE = 8;

type IntroTransition = {
  active: boolean;
  startedAtMs: number;
  startPos: Vector3;
  endPos: Vector3;
  startDir: Vector3;
  endDir: Vector3;
};

type BodySphere = {
  center: Vector3;
  radius: number;
};

const easeInOutCubic = (x: number): number =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

const closestPointOnSegment = (
  start: Vector3,
  end: Vector3,
  point: Vector3,
  out: Vector3,
): Vector3 => {
  out.subVectors(end, start);
  const lenSq = out.lengthSq();
  if (lenSq <= 1e-8) return out.copy(start);
  const t = Math.max(
    0,
    Math.min(1, point.clone().sub(start).dot(out) / lenSq),
  );
  return out.copy(start).addScaledVector(out, t);
};

const segmentIntersectsSphere = (
  start: Vector3,
  end: Vector3,
  center: Vector3,
  radius: number,
  tmp: Vector3,
): boolean => closestPointOnSegment(start, end, center, tmp).distanceTo(center) <= radius;

export const SkyFocusCamera = () => {
  const camera = useThree((s) => s.camera);
  const selectedConstellation = useStore((s) => s.selectedConstellation);
  const skyFocusId = useStore((s) => s.skyFocusId);
  const viewMode = useStore((s) => s.viewMode);
  const navigationMode = useStore((s) => s.navigationMode);
  const setIsTraveling = useStore((s) => s.setIsTraveling);

  const currentDirRef = useRef(new Vector3());
  const tmpDirRef = useRef(new Vector3());
  const tmpClosestRef = useRef(new Vector3());
  const tmpRightRef = useRef(new Vector3());
  const introRef = useRef<IntroTransition>({
    active: false,
    startedAtMs: 0,
    startPos: new Vector3(),
    endPos: new Vector3(),
    startDir: new Vector3(),
    endDir: new Vector3(),
  });
  const lookAtRef = useMemo(() => new Vector3(), []);
  const lastSkyFocusIdRef = useRef(-1);

  const getBodySpheres = useCallback((): BodySphere[] => {
    const bodies: BodySphere[] = [];
    for (const planet of PLANETS) {
      bodies.push({
        center: getLivePosition(planet.id).clone(),
        radius: planet.radius + BODY_PADDING,
      });
    }
    for (const moon of MOONS) {
      bodies.push({
        center: getLivePosition(moon.parent).clone().add(getLiveMoonOffset(moon.id)),
        radius: moon.radius + BODY_PADDING,
      });
    }
    return bodies;
  }, []);

  const findSafeEndPosition = useCallback(
    (startPos: Vector3, direction: Vector3): Vector3 => {
      const bodies = getBodySpheres();
      let distance = INTRO_MOVE_DISTANCE;
      const end = new Vector3();

      while (distance >= MIN_SAFE_MOVE_DISTANCE) {
        end.copy(startPos).addScaledVector(direction, distance);
        let hit = false;
        for (const body of bodies) {
          if (
            segmentIntersectsSphere(
              startPos,
              end,
              body.center,
              body.radius,
              tmpClosestRef.current,
            )
          ) {
            hit = true;
            break;
          }
        }
        if (!hit) return end;
        distance *= 0.5;
      }
      return startPos.clone();
    },
    [getBodySpheres],
  );

  useEffect(() => {
    if (!selectedConstellation) {
      introRef.current.active = false;
      setIsTraveling(false);
    }
  }, [selectedConstellation, setIsTraveling]);

  useEffect(() => {
    if (!selectedConstellation) return;
    if (skyFocusId === lastSkyFocusIdRef.current) return;
    lastSkyFocusIdRef.current = skyFocusId;

    camera.getWorldDirection(currentDirRef.current);
    const transition = introRef.current;
    transition.active = true;
    transition.startedAtMs = performance.now();
    transition.startPos.copy(camera.position);
    transition.startDir.copy(currentDirRef.current);

    tmpRightRef.current.crossVectors(transition.startDir, WORLD_UP).normalize();
    transition.endDir
      .copy(transition.startDir)
      .applyAxisAngle(tmpRightRef.current, INTRO_PITCH_RAD)
      .normalize();
    transition.endPos.copy(findSafeEndPosition(transition.startPos, transition.endDir));

    setIsTraveling(true);
  }, [
    camera,
    selectedConstellation,
    skyFocusId,
    setIsTraveling,
    findSafeEndPosition,
  ]);

  useFrame(() => {
    const transition = introRef.current;
    if (!transition.active) return;

    if (navigationMode === 'free' || viewMode !== 'overview') {
      transition.active = false;
      setIsTraveling(false);
      return;
    }

    const progress = Math.min(
      1,
      (performance.now() - transition.startedAtMs) / INTRO_DURATION_MS,
    );
    const eased = easeInOutCubic(progress);

    // Keep heading stable: only the intro pitch (upward) plus forward move.
    tmpDirRef.current
      .copy(transition.startDir)
      .lerp(transition.endDir, eased)
      .normalize();
    camera.position.lerpVectors(transition.startPos, transition.endPos, eased);
    lookAtRef.copy(camera.position).addScaledVector(tmpDirRef.current, LOOK_AT_DISTANCE);
    camera.up.copy(WORLD_UP);
    camera.lookAt(lookAtRef);

    if (progress >= 1) {
      transition.active = false;
      setIsTraveling(false);
    }
  }, 1);

  return null;
};

