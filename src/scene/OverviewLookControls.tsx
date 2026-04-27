import { useEffect, useMemo, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { Euler } from "three";
import { useStore } from "../store/useStore";

const LOOK_SENSITIVITY = 0.003;
const MAX_PITCH = Math.PI / 2 - 0.05;
export const OverviewLookControls = () => {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const viewMode = useStore((s) => s.viewMode);
  const navigationMode = useStore((s) => s.navigationMode);
  const isTraveling = useStore((s) => s.isTraveling);

  const enabled =
    viewMode === "overview" && navigationMode === "cinematic" && !isTraveling;

  const dragActiveRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  /** Pointers currently down on the canvas (for pinch vs orbit). */
  const canvasPointerIdsRef = useRef(new Set<number>());
  const euler = useMemo(() => new Euler(0, 0, 0, "YXZ"), []);

  useEffect(() => {
    const canvas = gl.domElement;
    const canvasPointerIds = canvasPointerIdsRef.current;

    const pointerOnCanvas = (event: PointerEvent): boolean =>
      event.target === canvas ||
      (event.target instanceof Node && canvas.contains(event.target));

    const onPointerDown = (event: PointerEvent): void => {
      if (pointerOnCanvas(event)) {
        const hadPointer = canvasPointerIds.size > 0;
        canvasPointerIds.add(event.pointerId);
        if (hadPointer && enabled) {
          dragActiveRef.current = false;
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
      if (canvasPointerIds.size > 1) return;
      dragActiveRef.current = true;
      lastPointerRef.current = { x: event.clientX, y: event.clientY };
      canvas.style.cursor = "grabbing";
    };

    const onPointerMove = (event: PointerEvent): void => {
      if (!enabled || !dragActiveRef.current) return;
      if (canvasPointerIds.size > 1) return;
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
      canvas.style.cursor = "";
    };

    const onPointerUp = (event: PointerEvent): void => {
      canvasPointerIds.delete(event.pointerId);
      endDrag();
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
      canvas.style.cursor = "";
    };
  }, [camera, enabled, euler, gl]);

  return null;
};
