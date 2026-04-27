/** Preset time scale factors (simulation days per real second). */
export const TIME_SPEED_PRESETS: readonly number[] = [0.25, 1, 7, 30, 365];

/** Same default as "play" in time controls (third preset) — show and simulate one value from load. */
export const DEFAULT_TIME_SCALE: number = TIME_SPEED_PRESETS[2] ?? 1;

export const formatTimeScaleNumber = (scale: number): string =>
  scale < 1
    ? scale.toFixed(2)
    : Number.isInteger(scale)
      ? String(scale)
      : scale.toFixed(1);

export const formatDaysPerSecond = (scale: number): string =>
  `${formatTimeScaleNumber(scale)} d/s`;
