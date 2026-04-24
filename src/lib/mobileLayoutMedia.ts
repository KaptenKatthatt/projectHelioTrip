/**
 * Viewports that should use the mobile HUD / controls even when width ≥ Tailwind `sm` (640px),
 * e.g. phones in landscape (wide but short). Matches must stay in sync with `useIsMobileLayout`.
 */
export const MOBILE_LAYOUT_MEDIA_QUERY =
  '(max-width: 639px), ((hover: none) and (pointer: coarse) and (max-height: 560px))';

export function matchesMobileLayout(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia(MOBILE_LAYOUT_MEDIA_QUERY).matches
  );
}
