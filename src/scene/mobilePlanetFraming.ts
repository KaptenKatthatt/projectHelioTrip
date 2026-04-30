import type { Vector3 } from "three";

export const MOBILE_PLANET_SCREEN_LIFT_FRACTION = 0.2;

type ViewportSize = {
  readonly width: number;
  readonly height: number;
};

export const applyMobilePlanetScreenLift = (
  camera: { readonly fov: number; readonly position: Vector3 },
  targetDistance: number,
  targetY: number,
  viewport: ViewportSize,
  isMobileLayout: boolean,
): number => {
  const portraitCanvas = viewport.width <= viewport.height;
  if (!isMobileLayout || !portraitCanvas) return targetY;
  const halfFovRad = ((camera.fov * Math.PI) / 180) * 0.5;
  const verticalSpanAtTarget = Math.tan(halfFovRad) * targetDistance * 2;
  return targetY - verticalSpanAtTarget * MOBILE_PLANET_SCREEN_LIFT_FRACTION;
};
