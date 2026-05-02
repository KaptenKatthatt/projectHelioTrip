/**
 * Shared helpers for window-level pointer listeners used by canvas orbit / pinch handlers.
 */

export const isPointerEventOnCanvas = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
): boolean =>
  event.target === canvas ||
  (event.target instanceof Node && canvas.contains(event.target));

export type WindowPointerListenerBundle = {
  pointerdown: (event: PointerEvent) => void;
  pointermove: (event: PointerEvent) => void;
  pointerup: (event: PointerEvent) => void;
};

export const subscribeWindowPointerListeners = (
  listeners: WindowPointerListenerBundle,
): (() => void) => {
  window.addEventListener("pointerdown", listeners.pointerdown);
  window.addEventListener("pointermove", listeners.pointermove);
  window.addEventListener("pointerup", listeners.pointerup);
  window.addEventListener("pointercancel", listeners.pointerup);
  return () => {
    window.removeEventListener("pointerdown", listeners.pointerdown);
    window.removeEventListener("pointermove", listeners.pointermove);
    window.removeEventListener("pointerup", listeners.pointerup);
    window.removeEventListener("pointercancel", listeners.pointerup);
  };
};
