/**
 * Mobile Canvas Interaction Manager
 * 
 * Handles closing the mobile planet info bottom sheet when the user 
 * taps on the 3D canvas. Differentiates between short taps (dismiss) 
 * and long drags (orbit control).
 */
import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { useIsMobileLayout } from "../hooks/useIsMobileLayout";
import { consumePlanetInfoCanvasDismissSuppress } from "../lib/bodyPickPointer";
import { useStore } from "../store/useStore";

/** Pixels of movement before a pointer gesture counts as orbit drag, not a tap. */
const TAP_MOVE_PX = 14;

/**
 * When the mobile planet info sheet is open, a short tap on the canvas (empty
 * space or planet) closes the sheet; dragging still goes to OrbitControls.
 */
export const MobilePlanetInfoCanvasDismiss = (): null => {
  const gl = useThree((s) => s.gl);
  const mobileLayout = useIsMobileLayout();
  const sheetOpen = useStore((s) => s.mobilePlanetInfoSheetOpen);
  const viewMode = useStore((s) => s.viewMode);
  const activeBody = useStore((s) => s.activeBody);
  const isTraveling = useStore((s) => s.isTraveling);
  const setSheetOpen = useStore((s) => s.setMobilePlanetInfoSheetOpen);

  const showPlanetInfoUi =
    activeBody !== null && viewMode !== "overview" && !isTraveling;
  const enabled = mobileLayout && sheetOpen && showPlanetInfoUi;

  const setSheetOpenRef = useRef(setSheetOpen);

  useEffect(() => {
    setSheetOpenRef.current = setSheetOpen;
  }, [setSheetOpen]);

  useEffect(() => {
    if (!enabled) return;
    const canvas = gl.domElement;
    let down: { x: number; y: number } | null = null;

    const onDown = (e: PointerEvent): void => {
      if (e.button !== 0) return;
      if (e.target !== canvas) return;
      down = { x: e.clientX, y: e.clientY };
    };

    const onMove = (e: PointerEvent): void => {
      if (!down) return;
      if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > TAP_MOVE_PX) {
        down = null;
      }
    };

    const onUp = (e: PointerEvent): void => {
      if (!down) return;
      const start = down;
      down = null;
      if (e.button !== 0) return;
      if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > TAP_MOVE_PX) {
        return;
      }
      if (consumePlanetInfoCanvasDismissSuppress()) return;
      setSheetOpenRef.current(false);
    };

    const onCancel = (): void => {
      down = null;
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    return () => {
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
    };
  }, [enabled, gl]);

  return null;
};
