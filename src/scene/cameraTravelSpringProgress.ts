/**
 * Spring progress (0–1) for cinematic camera travel, written in
 * {@link CameraManager} and read in {@link PlanetViewportOffset}.
 * `null` when no travel animation is active.
 */
export const cameraTravelSpringProgressRef: { current: number | null } = {
  current: null,
};
