import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { easings, useSpring } from '@react-spring/three';
import { CatmullRomCurve3, Vector3 } from 'three';
import { useStore } from '../store/useStore';
import { getPlanet, type PlanetId } from '../lib/planets';
import { getLivePosition } from '../lib/positionsBus';

const TRAVEL_DURATION_MS = 3200;
const ARC_HEIGHT_FACTOR = 0.2;
const VIEW_DISTANCE_MULTIPLIER = 6;
const VIEW_DISTANCE_MIN = 8;

const OVERVIEW_POSITION = new Vector3(0.001, 900, 0.001);
const OVERVIEW_TARGET = new Vector3(0, 0, 0);

type PlanetTravel = {
  kind: 'planet';
  startPos: Vector3;
  planetId: PlanetId;
  viewDistance: number;
};

type OverviewTravel = {
  kind: 'overview';
  startPos: Vector3;
};

type Travel = PlanetTravel | OverviewTravel;

type Arrived =
  | { kind: 'planet'; planetId: PlanetId; viewDistance: number }
  | { kind: 'overview' };

/**
 * Places the camera offset from the planet in a stable cinematic angle:
 * slightly sunward, tangential to the orbit, and elevated. Because the
 * offset is rebuilt from the planet's current direction from the sun each
 * frame, the angle stays consistent as the planet moves in its orbit.
 */
const computeEndPos = (
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

export const CameraManager = () => {
  const camera = useThree((s) => s.camera);

  const travelId = useStore((s) => s.travelId);
  const setCameraPosition = useStore((s) => s.setCameraPosition);
  const arrive = useStore((s) => s.arrive);

  const travelRef = useRef<Travel | null>(null);
  const arrivedRef = useRef<Arrived | null>(null);

  const tmpPos = useMemo(() => new Vector3(), []);
  const tmpEndPos = useMemo(() => new Vector3(), []);
  const tmpTargetPos = useMemo(() => new Vector3(), []);
  const tmpMid = useMemo(() => new Vector3(), []);
  const curve = useMemo(
    () => new CatmullRomCurve3([new Vector3(), new Vector3(), new Vector3()]),
    [],
  );

  const [{ t }, api] = useSpring(() => ({
    t: 0,
    config: { duration: TRAVEL_DURATION_MS, easing: easings.easeInOutCubic },
  }));

  useEffect(() => {
    if (travelId === 0) return;

    const state = useStore.getState();
    const startPos = camera.position.clone();

    let travel: Travel;
    if (state.viewMode === 'overview') {
      travel = { kind: 'overview', startPos };
    } else if (state.activePlanet) {
      const planet = getPlanet(state.activePlanet);
      if (!planet) return;
      travel = {
        kind: 'planet',
        startPos,
        planetId: state.activePlanet,
        viewDistance: Math.max(
          VIEW_DISTANCE_MIN,
          planet.radius * VIEW_DISTANCE_MULTIPLIER,
        ),
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

        resolveEndPos(current, tmpEndPos);
        setCameraPosition(tmpEndPos);
        arrive();
        arrivedRef.current =
          current.kind === 'planet'
            ? {
                kind: 'planet',
                planetId: current.planetId,
                viewDistance: current.viewDistance,
              }
            : { kind: 'overview' };
        travelRef.current = null;
      },
    });
  }, [travelId, camera, api, setCameraPosition, arrive, tmpEndPos]);

  useFrame(() => {
    const travel = travelRef.current;

    if (travel) {
      resolveEndPos(travel, tmpEndPos);
      resolveTarget(travel, tmpTargetPos);

      tmpMid.lerpVectors(travel.startPos, tmpEndPos, 0.5);
      tmpMid.y +=
        travel.startPos.distanceTo(tmpEndPos) * ARC_HEIGHT_FACTOR;

      curve.points[0].copy(travel.startPos);
      curve.points[1].copy(tmpMid);
      curve.points[2].copy(tmpEndPos);
      curve.getPoint(t.get(), tmpPos);

      camera.position.copy(tmpPos);
      camera.up.set(0, 1, 0);
      camera.lookAt(tmpTargetPos);
      return;
    }

    const arrived = arrivedRef.current;
    if (!arrived) return;

    if (arrived.kind === 'planet') {
      tmpTargetPos.copy(getLivePosition(arrived.planetId));
      computeEndPos(tmpTargetPos, arrived.viewDistance, tmpEndPos);
      camera.position.copy(tmpEndPos);
    } else {
      tmpTargetPos.copy(OVERVIEW_TARGET);
      camera.position.copy(OVERVIEW_POSITION);
    }
    camera.up.set(0, 1, 0);
    camera.lookAt(tmpTargetPos);
  });

  return null;
};

const resolveEndPos = (travel: Travel, out: Vector3): void => {
  if (travel.kind === 'overview') {
    out.copy(OVERVIEW_POSITION);
    return;
  }
  const planetPos = getLivePosition(travel.planetId);
  computeEndPos(planetPos, travel.viewDistance, out);
};

const resolveTarget = (travel: Travel, out: Vector3): void => {
  if (travel.kind === 'overview') {
    out.copy(OVERVIEW_TARGET);
    return;
  }
  out.copy(getLivePosition(travel.planetId));
};
