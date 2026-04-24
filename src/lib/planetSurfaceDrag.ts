import type { BodyId } from './bodies';

const SPIN_RAD_PER_PX = 0.006;

const manualSpinY = new Map<BodyId, number>();

function addBodyManualSpinY(id: BodyId, delta: number): void {
  manualSpinY.set(id, (manualSpinY.get(id) ?? 0) + delta);
}

export type PlanetSurfaceDragRuntime = {
  active: boolean;
  bodyId: BodyId | null;
  lastClientX: number;
  pointerId: number;
};

export const planetSurfaceDragState: PlanetSurfaceDragRuntime = {
  active: false,
  bodyId: null,
  lastClientX: 0,
  pointerId: -1,
};

let detachDocumentListeners: (() => void) | null = null;

function finalizePlanetSurfaceDrag(): void {
  if (!planetSurfaceDragState.active) return;
  planetSurfaceDragState.active = false;
  planetSurfaceDragState.bodyId = null;
  planetSurfaceDragState.pointerId = -1;
}

export function getBodyManualSpinY(id: BodyId): number {
  return manualSpinY.get(id) ?? 0;
}

export function beginPlanetSurfaceDrag(
  bodyId: BodyId,
  clientX: number,
  pointerId: number,
): void {
  endPlanetSurfaceDrag();

  planetSurfaceDragState.active = true;
  planetSurfaceDragState.bodyId = bodyId;
  planetSurfaceDragState.lastClientX = clientX;
  planetSurfaceDragState.pointerId = pointerId;

  const onMove = (e: PointerEvent): void => {
    if (e.pointerId !== pointerId) return;
    movePlanetSurfaceDrag(bodyId, e.clientX);
  };

  const onUpOrCancel = (e: PointerEvent): void => {
    if (e.pointerId !== pointerId) return;
    detachDocumentListeners?.();
    detachDocumentListeners = null;
    finalizePlanetSurfaceDrag();
  };

  document.addEventListener('pointermove', onMove);
  document.addEventListener('pointerup', onUpOrCancel);
  document.addEventListener('pointercancel', onUpOrCancel);

  detachDocumentListeners = (): void => {
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup', onUpOrCancel);
    document.removeEventListener('pointercancel', onUpOrCancel);
  };
}

export function movePlanetSurfaceDrag(bodyId: BodyId, clientX: number): void {
  if (
    !planetSurfaceDragState.active ||
    planetSurfaceDragState.bodyId !== bodyId
  ) {
    return;
  }
  const dx = clientX - planetSurfaceDragState.lastClientX;
  planetSurfaceDragState.lastClientX = clientX;
  addBodyManualSpinY(bodyId, dx * SPIN_RAD_PER_PX);
}

export function endPlanetSurfaceDrag(): void {
  detachDocumentListeners?.();
  detachDocumentListeners = null;
  finalizePlanetSurfaceDrag();
}
