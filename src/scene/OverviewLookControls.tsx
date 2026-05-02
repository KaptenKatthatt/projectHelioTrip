import { useEffect, useMemo, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { Euler } from "three";
import { useOverviewCinematicEnabled } from "../hooks/useOverviewCinematicEnabled";
import {
  isBodyPickPointer,
  unregisterBodyPickPointer,
} from "../lib/bodyPickPointer";
import {
  isPointerEventOnCanvas,
  subscribeWindowPointerListeners,
} from "../lib/windowPointerListeners";

const LOOK_SENSITIVITY = 0.003;
const MAX_PITCH = Math.PI / 2 - 0.05;
/**
 * Orbit drag only starts after this screen distance so short taps (e.g. on a
 * planet via {@link BodyPickers}) are not eaten by sub-pixel jitter.
 */
const DRAG_THRESHOLD_PX = 10;
const DRAG_THRESHOLD_SQ = DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX;

export const OverviewLookControls = () => {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const enabled = useOverviewCinematicEnabled();

  const dragActiveRef = useRef(false);
  const pendingDragRef = useRef<{ x: number; y: number } | null>(null);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  /** Pointers currently down on the canvas (for pinch vs orbit). */
  const canvasPointerIdsRef = useRef(new Set<number>());
  const euler = useMemo(() => new Euler(0, 0, 0, "YXZ"), []);

  useEffect(() => {
    const canvas = gl.domElement;
    const canvasPointerIds = canvasPointerIdsRef.current;

    const onPointerDown = (event: PointerEvent): void => {
      if (isPointerEventOnCanvas(canvas, event)) {
        const hadPointer = canvasPointerIds.size > 0;
        canvasPointerIds.add(event.pointerId);
        if (hadPointer && enabled) {
          dragActiveRef.current = false;
          pendingDragRef.current = null;
          canvas.style.cursor = "";
        }
      }
      if (!enabled || event.button !== 0) return;
      const target = event.target;
      if (target instanceof HTMLElement) {
        const interactive = target.closest(
          'button,input,a,textarea,select,[role="button"]',
        );
        if (interactive) return;
      }
      if (isBodyPickPointer(event.pointerId)) return;
      if (canvasPointerIds.size > 1) return;
      pendingDragRef.current = { x: event.clientX, y: event.clientY };
      dragActiveRef.current = false;
    };

    const onPointerMove = (event: PointerEvent): void => {
      if (isBodyPickPointer(event.pointerId)) return;
      if (!enabled) return;
      if (canvasPointerIds.size > 1) return;

      const pending = pendingDragRef.current;
      if (pending && !dragActiveRef.current) {
        const dx = event.clientX - pending.x;
        const dy = event.clientY - pending.y;
        if (dx * dx + dy * dy >= DRAG_THRESHOLD_SQ) {
          dragActiveRef.current = true;
          pendingDragRef.current = null;
          lastPointerRef.current = { x: event.clientX, y: event.clientY };
          canvas.style.cursor = "grabbing";
        } else {
          return;
        }
      }

      if (!dragActiveRef.current) return;
      const dx = event.clientX - lastPointerRef.current.x;
      const dy = event.clientY - lastPointerRef.current.y;
      lastPointerRef.current = { x: event.clientX, y: event.clientY };

      euler.setFromQuaternion(camera.quaternion);
      euler.y -= dx * LOOK_SENSITIVITY;
      euler.x -= dy * LOOK_SENSITIVITY;
      euler.x = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, euler.x));
      camera.quaternion.setFromEuler(euler);
    };

    const endDrag = (): void => {
      dragActiveRef.current = false;
      pendingDragRef.current = null;
      canvas.style.cursor = "";
    };

    const onPointerUp = (event: PointerEvent): void => {
      unregisterBodyPickPointer(event.pointerId);
      canvasPointerIds.delete(event.pointerId);
      endDrag();
    };

    const unsubscribePointers = subscribeWindowPointerListeners({
      pointerdown: onPointerDown,
      pointermove: onPointerMove,
      pointerup: onPointerUp,
    });

    return () => {
      unsubscribePointers();
      canvasPointerIds.clear();
      canvas.style.cursor = "";
    };
  }, [camera, enabled, euler, gl]);

  return null;
};
