/**
 * Two-finger touch rotation for constellations (like Google Maps pinch rotation).
 * Pointer events on the canvas; updates constellationUserSpinRad via the store.
 */

import { useEffect, useRef } from "react";
import type { WebGLRenderer } from "three";
import { useThree } from "@react-three/fiber";
import { useStore } from "../store/useStore";
import { useOverviewCinematicEnabled } from "../hooks/useOverviewCinematicEnabled";
import { CONSTELLATION_PINCH_ROTATE_MQ } from "../lib/mobileLayoutMedia";
import {
  isPointerEventOnCanvas,
  subscribeWindowPointerListeners,
} from "../lib/windowPointerListeners";
import { useMediaQuery } from "../hooks/useMediaQuery";

const getAngleBetweenPointers = (
  pointer1: { x: number; y: number },
  pointer2: { x: number; y: number },
): number => {
  const dx = pointer2.x - pointer1.x;
  const dy = pointer2.y - pointer1.y;
  return Math.atan2(dy, dx);
};

const usePinchRotation = (
  gl: WebGLRenderer,
  enabled: boolean,
  adjustConstellationSpin: (rad: number) => void,
) => {
  const canvasPointerIdsRef = useRef(new Set<number>());
  const pointerPositionsRef = useRef(
    new Map<number, { x: number; y: number }>(),
  );
  const lastAngleRef = useRef<number | null>(null);
  const rotationActiveRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const canvas = gl.domElement;
    const canvasPointerIds = canvasPointerIdsRef.current;
    const pointerPositions = pointerPositionsRef.current;

    const onPointerDown = (event: PointerEvent): void => {
      if (isPointerEventOnCanvas(canvas, event)) {
        canvasPointerIds.add(event.pointerId);
        pointerPositions.set(event.pointerId, {
          x: event.clientX,
          y: event.clientY,
        });
      }

      if (canvasPointerIds.size === 2) {
        rotationActiveRef.current = true;
        lastAngleRef.current = null;
      }
    };

    const onPointerMove = (event: PointerEvent): void => {
      if (canvasPointerIds.has(event.pointerId)) {
        pointerPositions.set(event.pointerId, {
          x: event.clientX,
          y: event.clientY,
        });
      }

      if (!rotationActiveRef.current || canvasPointerIds.size !== 2) {
        return;
      }

      let id0: number | undefined;
      let id1: number | undefined;
      for (const id of canvasPointerIds) {
        if (id0 === undefined) {
          id0 = id;
        } else if (id1 === undefined) {
          id1 = id;
        }
      }

      if (id0 === undefined || id1 === undefined) return;
      if (id0 > id1) {
        const temp = id0;
        id0 = id1;
        id1 = temp;
      }
      const p0 = pointerPositions.get(id0);
      const p1 = pointerPositions.get(id1);
      if (!p0 || !p1) return;

      const currentAngle = getAngleBetweenPointers(p0, p1);

      if (lastAngleRef.current !== null) {
        const angleDelta = currentAngle - lastAngleRef.current;
        const normalizedDelta = Math.atan2(
          Math.sin(angleDelta),
          Math.cos(angleDelta),
        );
        adjustConstellationSpin(normalizedDelta);
      }

      lastAngleRef.current = currentAngle;
    };

    const onPointerUp = (event: PointerEvent): void => {
      canvasPointerIds.delete(event.pointerId);
      pointerPositions.delete(event.pointerId);

      if (canvasPointerIds.size < 2) {
        rotationActiveRef.current = false;
        lastAngleRef.current = null;
      }
    };

    const unsubscribePointers = subscribeWindowPointerListeners({
      pointerdown: onPointerDown,
      pointermove: onPointerMove,
      pointerup: onPointerUp,
    });

    return () => {
      unsubscribePointers();
      canvasPointerIds.clear();
      pointerPositions.clear();
      lastAngleRef.current = null;
      rotationActiveRef.current = false;
    };
  }, [enabled, adjustConstellationSpin, gl]);
};

export const ConstellationRotationControls = () => {
  const gl = useThree((s) => s.gl);
  const selectedConstellation = useStore((s) => s.selectedConstellation);
  const adjustConstellationSpin = useStore((s) => s.adjustConstellationSpin);
  const overviewCinematic = useOverviewCinematicEnabled();
  const pinchRotateEligible = useMediaQuery(CONSTELLATION_PINCH_ROTATE_MQ);

  const enabled = Boolean(
    selectedConstellation && overviewCinematic && pinchRotateEligible,
  );

  usePinchRotation(gl, enabled, adjustConstellationSpin);

  return null;
};
