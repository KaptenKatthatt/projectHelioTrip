import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { MOONS } from '../lib/moons';
import { PLANETS } from '../lib/planets';
import { getLiveMoonOffset, getLivePosition } from '../lib/positionsBus';
import { useStore } from '../store/useStore';

const LOOK_AT_DISTANCE = 100;
const NEAR_PARALLEL_THRESHOLD = 0.9995;
const WORLD_UP = new Vector3(0, 1, 0);
const INTRO_DURATION_MS = 2600;
const INTRO_MOVE_DISTANCE = 220;
const BODY_PADDING = 1.2;
const MIN_SAFE_MOVE_DISTANCE = 8;
const INTRO_PITCH_RAD = 0.42;

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

const slerpDirections = (
  from: Vector3,
  to: Vector3,
  t: number,
  out: Vector3,
): Vector3 => {
  const dot = Math.max(-1, Math.min(1, from.dot(to)));
  if (dot > NEAR_PARALLEL_THRESHOLD || dot < -NEAR_PARALLEL_THRESHOLD) {
    return out.copy(to);
  }
  const theta = Math.acos(dot);
  const sinTheta = Math.sin(theta);
  const fromWeight = Math.sin((1 - t) * theta) / sinTheta;
  const toWeight = Math.sin(t * theta) / sinTheta;
  out.copy(from).multiplyScalar(fromWeight).addScaledVector(to, toWeight);
  return out.normalize();
};

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
  const lastSkyFocusIdRef = useRef(-1);
  const lookAtRef = useMemo(() => new Vector3(), []);
  const bodyScratch = useMemo(
    () =>
      ({
        planetCenter: new Vector3(),
        moonCenter: new Vector3(),
      }) satisfies Record<string, Vector3>,
    [],
  );

  const getBodySpheres = (): BodySphere[] => {
    const bodies: BodySphere[] = [];
    for (const planet of PLANETS) {
      bodies.push({
        center: bodyScratch.planetCenter.copy(getLivePosition(planet.id)).clone(),
        radius: planet.radius + BODY_PADDING,
      });
    }
    for (const moon of MOONS) {
      bodies.push({
        center: bodyScratch.moonCenter
          .copy(getLivePosition(moon.parent))
          .add(getLiveMoonOffset(moon.id))
          .clone(),
        radius: moon.radius + BODY_PADDING,
      });
    }
    return bodies;
  };

  const findSafeEndPosition = (startPos: Vector3, direction: Vector3): Vector3 => {
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
  };

  useEffect(() => {
    if (!selectedConstellation) {
      introRef.current.active = false;
      setIsTraveling(false);
      return;
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
    transition.endPos.copy(
      findSafeEndPosition(transition.startPos, transition.endDir),
    );

    setIsTraveling(true);
  }, [camera, selectedConstellation, skyFocusId, setIsTraveling]);

  useFrame(() => {
    const transition = introRef.current;
    if (transition.active) {
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

      slerpDirections(
        transition.startDir,
        transition.endDir,
        eased,
        tmpDirRef.current,
      );
      currentDirRef.current.copy(tmpDirRef.current);
      camera.position.lerpVectors(transition.startPos, transition.endPos, eased);
      lookAtRef
        .copy(camera.position)
        .addScaledVector(currentDirRef.current, LOOK_AT_DISTANCE);
      camera.up.copy(WORLD_UP);
      camera.lookAt(lookAtRef);

      if (progress >= 1) {
        transition.active = false;
        setIsTraveling(false);
      }
      return;
    }
  }, 1);

  return null;
};

