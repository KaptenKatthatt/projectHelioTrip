import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { easings, useSpring } from '@react-spring/three';
import {
  CatmullRomCurve3,
  Object3D,
  Quaternion,
  Vector3,
} from 'three';
import { useStore } from '../store/useStore';
import { getPlanet } from '../lib/planets';
import { getLivePosition } from '../lib/positionsBus';

const TRAVEL_DURATION_MS = 3200;
const ARC_HEIGHT_FACTOR = 0.25;
const VIEW_DISTANCE_MULTIPLIER = 6;
const VIEW_DISTANCE_MIN = 8;

const OVERVIEW_POSITION = new Vector3(0, 900, 0.001);
const OVERVIEW_TARGET = new Vector3(0, 0, 0);

type Travel = {
  curve: CatmullRomCurve3;
  startQuat: Quaternion;
  endQuat: Quaternion;
  endPos: Vector3;
  targetPos: Vector3;
};

type Destination = {
  endPos: Vector3;
  targetPos: Vector3;
};

const computeDestination = (
  startPos: Vector3,
  state: ReturnType<typeof useStore.getState>,
): Destination | null => {
  if (state.viewMode === 'overview') {
    return {
      endPos: OVERVIEW_POSITION.clone(),
      targetPos: OVERVIEW_TARGET.clone(),
    };
  }
  if (!state.activePlanet) return null;
  const planet = getPlanet(state.activePlanet);
  if (!planet) return null;

  const targetPos = getLivePosition(state.activePlanet).clone();

  const viewDistance = Math.max(
    VIEW_DISTANCE_MIN,
    planet.radius * VIEW_DISTANCE_MULTIPLIER,
  );
  const offset = new Vector3().subVectors(startPos, targetPos);
  if (offset.lengthSq() < 1e-6) offset.set(0, planet.radius, viewDistance);
  offset.setLength(viewDistance);
  const endPos = targetPos.clone().add(offset);
  return { endPos, targetPos };
};

export const CameraManager = () => {
  const camera = useThree((s) => s.camera);

  const travelId = useStore((s) => s.travelId);
  const setCameraPosition = useStore((s) => s.setCameraPosition);
  const arrive = useStore((s) => s.arrive);

  const travelRef = useRef<Travel | null>(null);

  const tmpPos = useMemo(() => new Vector3(), []);
  const tmpQuat = useMemo(() => new Quaternion(), []);
  const dummy = useMemo(() => new Object3D(), []);

  const [{ t }, api] = useSpring(() => ({
    t: 0,
    config: { duration: TRAVEL_DURATION_MS, easing: easings.easeInOutCubic },
  }));

  useEffect(() => {
    if (travelId === 0) return;

    const state = useStore.getState();
    const startPos = camera.position.clone();
    const dest = computeDestination(startPos, state);
    if (!dest) return;

    const { endPos, targetPos } = dest;

    const mid = new Vector3().lerpVectors(startPos, endPos, 0.5);
    mid.y += startPos.distanceTo(endPos) * ARC_HEIGHT_FACTOR;

    const curve = new CatmullRomCurve3([startPos, mid, endPos]);

    const startQuat = camera.quaternion.clone();
    dummy.position.copy(endPos);
    dummy.up.set(0, 1, 0);
    dummy.lookAt(targetPos);
    dummy.updateMatrixWorld();
    const endQuat = dummy.quaternion.clone();

    travelRef.current = { curve, startQuat, endQuat, endPos, targetPos };

    api.start({
      from: { t: 0 },
      to: { t: 1 },
      onRest: (result) => {
        if (!result.finished) return;
        const travel = travelRef.current;
        if (!travel) return;
        setCameraPosition(travel.endPos);
        arrive();
        travelRef.current = null;
      },
    });
  }, [travelId, camera, dummy, api, setCameraPosition, arrive]);

  useFrame(() => {
    const travel = travelRef.current;
    if (!travel) return;

    const progress = t.get();

    travel.curve.getPoint(progress, tmpPos);
    camera.position.copy(tmpPos);

    tmpQuat.copy(travel.startQuat).slerp(travel.endQuat, progress);
    camera.quaternion.copy(tmpQuat);
  });

  return null;
};
