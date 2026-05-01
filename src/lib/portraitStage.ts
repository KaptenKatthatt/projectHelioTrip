import { matchesMobileLayout } from './mobileLayoutMedia';

/** Shorter viewport edge above this is treated as tablet-class — no portrait lock in landscape. */
export const PHONE_MAX_SHORT_EDGE_PX = 600;

export type PortraitStageSize = {
  width: number;
  height: number;
};

/**
 * Fits a portrait-aspect rectangle inside the viewport. In physical landscape, letterboxes
 * horizontally (stage height = shorter edge). In portrait, returns the full viewport.
 */
export function computePortraitStageSize(
  viewportW: number,
  viewportH: number,
): PortraitStageSize {
  const short = Math.min(viewportW, viewportH);
  const long = Math.max(viewportW, viewportH);
  if (short <= 0 || long <= 0) return { width: 0, height: 0 };

  if (viewportW > viewportH) {
    const height = short;
    const width = (short * short) / long;
    return { width: Math.round(width), height: Math.round(height) };
  }

  return { width: Math.round(short), height: Math.round(long) };
}

export function shouldPhoneLandscapePortraitLock(
  viewportW: number,
  viewportH: number,
  isMobileLayout: boolean,
  isLandscape: boolean,
): boolean {
  if (!isMobileLayout || !isLandscape) return false;
  return Math.min(viewportW, viewportH) <= PHONE_MAX_SHORT_EDGE_PX;
}

export function readPhoneLandscapePortraitLock(): {
  active: boolean;
  stage: PortraitStageSize;
} {
  if (typeof window === 'undefined') {
    return { active: false, stage: { width: 0, height: 0 } };
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const isLandscape = window.matchMedia('(orientation: landscape)').matches;
  const active = shouldPhoneLandscapePortraitLock(
    vw,
    vh,
    matchesMobileLayout(),
    isLandscape,
  );

  const stage = active ? computePortraitStageSize(vw, vh) : { width: 0, height: 0 };
  return { active, stage };
}
