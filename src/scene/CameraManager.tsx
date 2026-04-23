import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useSpring } from '@react-spring/three';
import { Vector3 } from 'three';
import { useStore } from '../store/useStore';
import {
  getBody,
  getBodyParent,
  getBodyWorldPosition,
  type BodyId,
} from '../lib/bodies';
import { getLivePosition } from '../lib/positionsBus';

const AIM_DURATION_MS = 700;
const FLY_DURATION_MS = 2800;
const TOTAL_DURATION_MS = AIM_DURATION_MS + FLY_DURATION_MS;
const AIM_FRACTION = AIM_DURATION_MS / TOTAL_DURATION_MS;

const ARC_HEIGHT_FACTOR = 0.18;
const PLANET_VIEW_DISTANCE_MULTIPLIER = 6;
const PLANET_VIEW_DISTANCE_MIN = 8;
const MOON_VIEW_DISTANCE_MULTIPLIER = 8;
const MOON_VIEW_DISTANCE_MIN = 2.5;
const LOOK_AT_DISTANCE = 100;
const NEAR_ANTIPODAL_THRESHOLD = 0.9995;

const OVERVIEW_POSITION = new Vector3(0.001, 900, 0.001);
const OVERVIEW_TARGET = new Vector3(0, 0, 0);
const WORLD_UP = new Vector3(0, 1, 0);

type BodyTravel = {
  kind: 'body';
  startPos: Vector3;
  startForward: Vector3;
  bodyId: BodyId;
  viewDistance: number;
};

type OverviewTravel = {
  kind: 'overview';
  startPos: Vector3;
  startForward: Vector3;
};

type Travel = BodyTravel | OverviewTravel;

type Arrived =
  | { kind: 'body'; bodyId: BodyId; viewDistance: number }
  | { kind: 'overview' };

const easeInOutCubic = (x: number): number =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

/**
 * Launch-and-glide easing: slow takeoff, acceleration through the middle,
 * soft deceleration on approach. Gives travel a rocket-like feel.
 */
const easeInOutQuart = (x: number): number =>
  x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;

/**
 * Spherical linear interpolation of two unit direction vectors. Produces
 * the shortest great-circle arc between `a` and `b`. Safe for parallel or
 * near-antipodal inputs (falls back to `b` to avoid division by zero).
 */
const slerpDirections = (
  a: Vector3,
  b: Vector3,
  t: number,
  out: Vector3,
): Vector3 => {
  const dot = Math.max(-1, Math.min(1, a.dot(b)));
  if (dot > NEAR_ANTIPODAL_THRESHOLD) {
    return out.copy(b);
  }
  if (dot < -NEAR_ANTIPODAL_THRESHOLD) {
    return out.copy(b);
  }
  const theta = Math.acos(dot);
  const sinTheta = Math.sin(theta);
  const wA = Math.sin((1 - t) * theta) / sinTheta;
  const wB = Math.sin(t * theta) / sinTheta;
  out.copy(a).multiplyScalar(wA).addScaledVector(b, wB);
  return out.normalize();
};

/**
 * Places the camera at a stable cinematic angle relative to a planet:
 * slightly sunward, tangential to the orbit, and elevated. Rebuilt from
 * the planet's current direction from the sun each frame, so the angle
 * stays consistent as the planet orbits.
 */
const computePlanetEndPos = (
  planetPos: Vector3,
  viewDistance: number,
  out: Vector3,
): void => {
  const dist = Math.hypot(planetPos.x, planetPos.z);
  const dirX = dist > 1e-6 ? planetPos.x / dist : 1;
  const dirZ = dist > 1e-6 ? planetPos.z / dist : 0;

  const tangentX = -dirZ;
  const tangentZ = dirX;

  out.set(
    dirX * -0.5 + tangentX * 0.75,
    0.45,
    dirZ * -0.5 + tangentZ * 0.75,
  );
  out.setLength(viewDistance);
  out.add(planetPos);
};

/**
 * Places the camera outside a child body (moon/satellite) along the
 * parent→child axis, so the body fills the frame with its parent
 * dramatically in the background. Falls back to a sunward offset if
 * the body coincides with its parent (very early, before any offset
 * data has landed).
 */
const computeChildBodyEndPos = (
  childPos: Vector3,
  parentPos: Vector3,
  viewDistance: number,
  out: Vector3,
): void => {
  const dx = childPos.x - parentPos.x;
  const dy = childPos.y - parentPos.y;
  const dz = childPos.z - parentPos.z;
  const len = Math.hypot(dx, dy, dz);

  if (len < 1e-4) {
    out.set(1, 0.3, 0).setLength(viewDistance).add(childPos);
    return;
  }

  const inv = 1 / len;
  out.set(dx * inv, dy * inv, dz * inv);
  out.y += 0.25;
  out.setLength(viewDistance);
  out.add(childPos);
};

const resolveTarget = (travel: Travel, out: Vector3): void => {
  if (travel.kind === 'overview') {
    out.copy(OVERVIEW_TARGET);
    return;
  }
  getBodyWorldPosition(travel.bodyId, out);
};

const resolveEndPos = (travel: Travel, out: Vector3, scratch: Vector3): void => {
  if (travel.kind === 'overview') {
    out.copy(OVERVIEW_POSITION);
    return;
  }
  getBodyWorldPosition(travel.bodyId, scratch);
  const parent = getBodyParent(travel.bodyId);
  if (parent) {
    computeChildBodyEndPos(
      scratch,
      getLivePosition(parent),
      travel.viewDistance,
      out,
    );
    return;
  }
  computePlanetEndPos(scratch, travel.viewDistance, out);
};

const computeViewDistance = (bodyId: BodyId, radius: number): number => {
  if (getBodyParent(bodyId)) {
    return Math.max(MOON_VIEW_DISTANCE_MIN, radius * MOON_VIEW_DISTANCE_MULTIPLIER);
  }
  return Math.max(
    PLANET_VIEW_DISTANCE_MIN,
    radius * PLANET_VIEW_DISTANCE_MULTIPLIER,
  );
};

export const CameraManager = () => {
  const camera = useThree((s) => s.camera);

  const travelId = useStore((s) => s.travelId);
  const selectedConstellation = useStore((s) => s.selectedConstellation);
  const setCameraPosition = useStore((s) => s.setCameraPosition);
  const arrive = useStore((s) => s.arrive);

  const travelRef = useRef<Travel | null>(null);
  const arrivedRef = useRef<Arrived | null>(null);

  const tmpPos = useMemo(() => new Vector3(), []);
  const tmpEndPos = useMemo(() => new Vector3(), []);
  const tmpTargetPos = useMemo(() => new Vector3(), []);
  const tmpScratch = useMemo(() => new Vector3(), []);
  const tmpDir = useMemo(() => new Vector3(), []);
  const tmpInterpDir = useMemo(() => new Vector3(), []);
  const tmpLookAt = useMemo(() => new Vector3(), []);

  const [{ t }, api] = useSpring(() => ({
    t: 0,
    config: { duration: TOTAL_DURATION_MS, easing: (x: number) => x },
  }));

  useEffect(() => {
    if (travelId === 0) return;

    const state = useStore.getState();
    const startPos = camera.position.clone();
    const startForward = new Vector3();
    camera.getWorldDirection(startForward);

    let travel: Travel;
    if (state.viewMode === 'overview') {
      travel = { kind: 'overview', startPos, startForward };
    } else if (state.activeBody) {
      const body = getBody(state.activeBody);
      if (!body) return;
      travel = {
        kind: 'body',
        startPos,
        startForward,
        bodyId: state.activeBody,
        viewDistance: computeViewDistance(state.activeBody, body.def.radius),
      };
    } else {
      return;
    }

    travelRef.current = travel;
    arrivedRef.current = null;

    api.start({
      from: { t: 0 },
      to: { t: 1 },
      onRest: (result) => {
        if (!result.finished) return;
        const current = travelRef.current;
        if (!current) return;

        resolveEndPos(current, tmpEndPos, tmpScratch);
        setCameraPosition(tmpEndPos);
        arrive();
        arrivedRef.current =
          current.kind === 'body'
            ? {
                kind: 'body',
                bodyId: current.bodyId,
                viewDistance: current.viewDistance,
              }
            : { kind: 'overview' };
        travelRef.current = null;
      },
    });
  }, [
    travelId,
    camera,
    api,
    setCameraPosition,
    arrive,
    tmpEndPos,
    tmpScratch,
  ]);

  useFrame(() => {
    if (useStore.getState().navigationMode === 'free') return;

    const travel = travelRef.current;

    if (travel) {
      const progress = t.get();
      resolveTarget(travel, tmpTargetPos);

      if (progress <= AIM_FRACTION) {
        const aim = easeInOutCubic(progress / AIM_FRACTION);

        tmpDir
          .copy(tmpTargetPos)
          .sub(travel.startPos)
          .normalize();

        slerpDirections(travel.startForward, tmpDir, aim, tmpInterpDir);

        tmpLookAt
          .copy(travel.startPos)
          .addScaledVector(tmpInterpDir, LOOK_AT_DISTANCE);

        camera.position.copy(travel.startPos);
        camera.up.copy(WORLD_UP);
        camera.lookAt(tmpLookAt);
        return;
      }

      const fly = easeInOutQuart(
        (progress - AIM_FRACTION) / (1 - AIM_FRACTION),
      );

      resolveEndPos(travel, tmpEndPos, tmpScratch);
      tmpPos.lerpVectors(travel.startPos, tmpEndPos, fly);
      const arcHeight =
        travel.startPos.distanceTo(tmpEndPos) * ARC_HEIGHT_FACTOR;
      tmpPos.y += Math.sin(fly * Math.PI) * arcHeight;

      camera.position.copy(tmpPos);
      camera.up.copy(WORLD_UP);
      camera.lookAt(tmpTargetPos);
      return;
    }

    const arrived = arrivedRef.current;
    if (!arrived) return;

    /**
     * After arriving at a body, `PlanetOrbitControls` owns the camera:
     * it tracks the body's live position and lets the user orbit/zoom.
     * Writing `camera.position` here would fight OrbitControls and
     * snap the camera back to the cinematic offset every frame.
     */
    if (arrived.kind === 'body') return;
    if (selectedConstellation) return;

    tmpTargetPos.copy(OVERVIEW_TARGET);
    camera.position.copy(OVERVIEW_POSITION);
    camera.up.copy(WORLD_UP);
    camera.lookAt(tmpTargetPos);
  });

  return null;
};
