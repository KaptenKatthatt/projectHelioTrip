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
  const animStateRef = useRef<{ 
    startPos: THREE.Vector3; 
    startQuat: THREE.Quaternion; 
    startTime: number 
  } | null>(null);
  const hasCompletedTakeoffRef = useRef(false);
  const tempMatrix = useRef(new THREE.Matrix4());
  const tempQuat = useRef(new THREE.Quaternion());
  const tempLookAtTarget = useRef(new THREE.Vector3(0, 0, 0));
  const tempLookAtUp = useRef(new THREE.Vector3(0, 1, 0));

  useEffect(() => {
    targetPosRef.current = null;
    animStateRef.current = null;
    hasCompletedTakeoffRef.current = false;
  }, [moonTransitionState]);

  useFrame((state) => {
    if (moonTransitionState === 'taking_off') {
      if (!targetPosRef.current) {
        // We capture the current position and orientation once at the start of takeoff
        const currentPos = camera.position.clone();
        const currentQuat = camera.quaternion.clone();
        
        targetPosRef.current = currentPos
          .clone()
          .multiplyScalar(CAMERA_SETTINGS.TAKE_OFF_DISTANCE_MULT);
        targetPosRef.current.y = Math.max(
          targetPosRef.current.y,
          CAMERA_SETTINGS.TAKE_OFF_HEIGHT_MIN,
        );
        animStateRef.current = { 
          startPos: currentPos, 
          startQuat: currentQuat,
          startTime: state.clock.elapsedTime * 1000 
        };
      }

      if (!animStateRef.current || !targetPosRef.current) return;

      const elapsed = (state.clock.elapsedTime * 1000) - animStateRef.current.startTime;
      const progress = Math.min(elapsed / CAMERA_SETTINGS.TAKE_OFF_DURATION, 1.0);
      const easeIn = progress * progress * progress;

      // Smoothly interpolate position
      camera.position.lerpVectors(animStateRef.current.startPos, targetPosRef.current, easeIn);
      
      // Calculate the target rotation (looking at center) from the CURRENT position
      tempMatrix.current.lookAt(
        camera.position,
        tempLookAtTarget.current,
        tempLookAtUp.current,
      );
      tempQuat.current.setFromRotationMatrix(tempMatrix.current);
      
      // Smoothly interpolate rotation (slerp) to avoid snapping
      camera.quaternion.slerpQuaternions(
        animStateRef.current.startQuat,
        tempQuat.current,
        easeIn,
      );
      
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
          startQuat: camera.quaternion.clone(),
          startTime: (state.clock.elapsedTime * 1000) + CAMERA_SETTINGS.FLY_IN_DELAY,
        };
      }

      if (!animStateRef.current || !targetPosRef.current) return;

      const now = state.clock.elapsedTime * 1000;
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
