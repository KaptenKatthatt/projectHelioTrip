import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { SKY_TARGET_DIRECTIONS } from '../lib/skyTargets';
import { useStore } from '../store/useStore';

const LOOK_AT_DISTANCE = 100;
const MAX_ROTATION_SPEED = 1.7;
const SNAP_ANGLE_RAD = 0.0035;
const NEAR_PARALLEL_THRESHOLD = 0.9995;
const WORLD_UP = new Vector3(0, 1, 0);

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

export const SkyFocusCamera = () => {
  const camera = useThree((s) => s.camera);
  const selectedConstellation = useStore((s) => s.selectedConstellation);
  const skyFocusId = useStore((s) => s.skyFocusId);
  const isTraveling = useStore((s) => s.isTraveling);
  const viewMode = useStore((s) => s.viewMode);
  const navigationMode = useStore((s) => s.navigationMode);

  const activeRef = useRef(false);
  const currentDirRef = useRef(new Vector3());
  const targetDirRef = useRef(new Vector3());
  const tmpDirRef = useRef(new Vector3());
  const lookAtRef = useMemo(() => new Vector3(), []);

  useEffect(() => {
    if (!selectedConstellation) {
      activeRef.current = false;
      return;
    }
    const target = SKY_TARGET_DIRECTIONS[selectedConstellation];
    if (!target) {
      activeRef.current = false;
      return;
    }
    camera.getWorldDirection(currentDirRef.current);
    targetDirRef.current.copy(target);
    activeRef.current = true;
  }, [camera, selectedConstellation, skyFocusId]);

  useFrame((_, delta) => {
    if (!activeRef.current) return;
    if (isTraveling || viewMode !== 'overview') return;
    if (navigationMode === 'free') {
      activeRef.current = false;
      return;
    }
    if (delta <= 0) return;

    const currentDir = currentDirRef.current;
    const targetDir = targetDirRef.current;
    const angle = currentDir.angleTo(targetDir);
    const maxStep = Math.max(0, MAX_ROTATION_SPEED * delta);
    const t = angle > 1e-6 ? Math.min(1, maxStep / angle) : 1;
    slerpDirections(currentDir, targetDir, t, tmpDirRef.current);
    currentDir.copy(tmpDirRef.current);
    lookAtRef.copy(camera.position).addScaledVector(currentDir, LOOK_AT_DISTANCE);
    camera.up.copy(WORLD_UP);
    camera.lookAt(lookAtRef);

    if (currentDir.angleTo(targetDir) <= SNAP_ANGLE_RAD) {
      activeRef.current = false;
    }
  }, 1);

  return null;
};

