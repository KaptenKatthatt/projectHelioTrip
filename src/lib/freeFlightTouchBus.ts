/**
 * Mutable touch axes for free flight (read from `useFrame`, written from
 * pointer handlers). Avoids React state churn at 60fps.
 *
 * Components clamp to roughly the unit circle; consumers apply deadzones.
 */
export type FreeFlightTouchAxes = {
  x: number;
  y: number;
};

export const freeFlightTouchBus: {
  move: FreeFlightTouchAxes;
  look: FreeFlightTouchAxes;
} = {
  move: { x: 0, y: 0 },
  look: { x: 0, y: 0 },
};

export const resetFreeFlightTouch = (): void => {
  freeFlightTouchBus.move.x = 0;
  freeFlightTouchBus.move.y = 0;
  freeFlightTouchBus.look.x = 0;
  freeFlightTouchBus.look.y = 0;
};
