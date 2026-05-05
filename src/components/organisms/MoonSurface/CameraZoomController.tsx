/**
 * Camera Animation Controller for Moon Landing
 * 
 * This component handles the automated camera movement during landing ('isFlyingIn')
 * and takeoff ('taking_off'). It uses the values defined in constants.ts
 * to interpolate the camera position and orientation.
 */
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../../store/useStore';
import { CAMERA_SETTINGS } from './constants';

export const CameraZoomController = ({
  isFlyingIn,
  setIsFlyingIn,
  onTakeoffComplete,
}: {
  isFlyingIn: boolean;
  setIsFlyingIn: (v: boolean) => void;
  onTakeoffComplete: () => void;
}) => {
  const moonTransitionState = useStore((s) => s.moonTransitionState);
  const { camera } = useThree();
  const targetPosRef = useRef<THREE.Vector3 | null>(null);
  const animStateRef = useRef<{ startPos: THREE.Vector3; startTime: number } | null>(null);
  const hasCompletedTakeoffRef = useRef(false);

  useEffect(() => {
    targetPosRef.current = null;
    animStateRef.current = null;
    hasCompletedTakeoffRef.current = false;
  }, [moonTransitionState]);

  useFrame(() => {
    if (moonTransitionState === 'taking_off') {
      if (!targetPosRef.current) {
        targetPosRef.current = camera.position
          .clone()
          .multiplyScalar(CAMERA_SETTINGS.TAKE_OFF_DISTANCE_MULT);
        targetPosRef.current.y = Math.max(
          targetPosRef.current.y,
          CAMERA_SETTINGS.TAKE_OFF_HEIGHT_MIN,
        );
        animStateRef.current = { startPos: camera.position.clone(), startTime: performance.now() };
      }

      if (!animStateRef.current || !targetPosRef.current) return;

      const elapsed = performance.now() - animStateRef.current.startTime;
      const progress = Math.min(elapsed / CAMERA_SETTINGS.TAKE_OFF_DURATION, 1.0);
      const easeIn = progress * progress * progress;

      camera.position.lerpVectors(animStateRef.current.startPos, targetPosRef.current, easeIn);
      camera.lookAt(0, 0, 0);
      if (progress >= 1.0 && !hasCompletedTakeoffRef.current) {
        hasCompletedTakeoffRef.current = true;
        onTakeoffComplete();
      }
    } else if (isFlyingIn) {
      if (!targetPosRef.current) {
        targetPosRef.current = CAMERA_SETTINGS.FLY_IN_END;
        camera.position.copy(CAMERA_SETTINGS.FLY_IN_START);
        animStateRef.current = {
          startPos: CAMERA_SETTINGS.FLY_IN_START.clone(),
          startTime: performance.now() + CAMERA_SETTINGS.FLY_IN_DELAY,
        };
      }

      if (!animStateRef.current || !targetPosRef.current) return;

      const now = performance.now();
      if (now < animStateRef.current.startTime) {
        camera.position.copy(animStateRef.current.startPos);
      } else {
        const elapsed = now - animStateRef.current.startTime;
        const progress = Math.min(elapsed / CAMERA_SETTINGS.FLY_IN_DURATION, 1.0);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);

        camera.position.lerpVectors(
          animStateRef.current.startPos,
          targetPosRef.current,
          easeOutQuart,
        );

        if (progress >= 1.0) setIsFlyingIn(false);
      }

      camera.lookAt(CAMERA_SETTINGS.LOOK_AT_TARGET);
    } else {
      targetPosRef.current = null;
      animStateRef.current = null;
    }
  });

  return null;
};
