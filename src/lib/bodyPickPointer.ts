/**
 * Tracks pointer ids whose down event hit a {@link BodyPickers} proxy sphere.
 * {@link OverviewLookControls} must ignore those pointers so orbit drag never
 * competes with planet selection (R3F mesh handlers run before window bubble).
 */

const activePointerIds = new Set<number>();

export const registerBodyPickPointer = (pointerId: number): void => {
  activePointerIds.add(pointerId);
};

export const unregisterBodyPickPointer = (pointerId: number): void => {
  activePointerIds.delete(pointerId);
};

export const isBodyPickPointer = (pointerId: number): boolean =>
  activePointerIds.has(pointerId);
