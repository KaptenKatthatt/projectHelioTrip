/**
 * Two-finger touch rotation for constellations (like Google Maps pinch rotation).
 * Pointer events on the canvas; updates constellationUserSpinRad via the store.
 */

import { useEffect, useRef, useState } from "react";
import { useThree } from "@react-three/fiber";
import { useStore } from "../store/useStore";
import { useOverviewCinematicEnabled } from "../hooks/useOverviewCinematicEnabled";
import { CONSTELLATION_PINCH_ROTATE_MQ } from "../lib/mobileLayoutMedia";

const getAngleBetweenPointers = (
  pointer1: { x: number; y: number },
  pointer2: { x: number; y: number },
): number => {
  const dx = pointer2.x - pointer1.x;
  const dy = pointer2.y - pointer1.y;
  return Math.atan2(dy, dx);
};

export const ConstellationRotationControls = () => {
  const gl = useThree((s) => s.gl);
  const selectedConstellation = useStore((s) => s.selectedConstellation);
  const adjustConstellationSpin = useStore((s) => s.adjustConstellationSpin);
  const overviewCinematic = useOverviewCinematicEnabled();

  const [pinchRotateEligible, setPinchRotateEligible] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(CONSTELLATION_PINCH_ROTATE_MQ).matches
      : false,
  );

  useEffect(() => {
    const mql = window.matchMedia(CONSTELLATION_PINCH_ROTATE_MQ);
    const onChange = (): void => {
      setPinchRotateEligible(mql.matches);
    };
    onChange();
    mql.addEventListener("change", onChange);
    return () => {
      mql.removeEventListener("change", onChange);
    };
  }, []);

  const canvasPointerIdsRef = useRef(new Set<number>());
  const pointerPositionsRef = useRef(
    new Map<number, { x: number; y: number }>(),
  );
  const lastAngleRef = useRef<number | null>(null);
  const rotationActiveRef = useRef(false);

  useEffect(() => {
    if (!selectedConstellation || !overviewCinematic || !pinchRotateEligible) {
      return;
    }

    const canvas = gl.domElement;
    const canvasPointerIds = canvasPointerIdsRef.current;
    const pointerPositions = pointerPositionsRef.current;

    const pointerOnCanvas = (event: PointerEvent): boolean =>
      event.target === canvas ||
      (event.target instanceof Node && canvas.contains(event.target));

    const onPointerDown = (event: PointerEvent): void => {
      if (pointerOnCanvas(event)) {
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

      const ids = Array.from(canvasPointerIds).sort((a, b) => a - b);
      const id0 = ids[0];
      const id1 = ids[1];
      if (id0 === undefined || id1 === undefined) return;
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

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      canvasPointerIds.clear();
      pointerPositions.clear();
      lastAngleRef.current = null;
      rotationActiveRef.current = false;
    };
  }, [
    selectedConstellation,
    overviewCinematic,
    pinchRotateEligible,
    adjustConstellationSpin,
    gl,
  ]);

  return null;
};
