/**
 * Viewports that should use the mobile HUD / controls even when width ≥ Tailwind `sm` (640px),
 * e.g. phones in landscape (wide but short). Matches must stay in sync with `useIsMobileLayout`.
 *
 * Some Android devices (e.g. Pixel) report `pointer: fine`; the landscape + short + not-too-wide
 * clause keeps them on the mobile layout without relying on coarse pointer alone.
 */
export const MOBILE_LAYOUT_MEDIA_QUERY =
  '(max-width: 639px), ((hover: none) and (pointer: coarse) and (max-height: 560px)), ((orientation: landscape) and (max-height: 520px) and (max-width: 960px))';

/** Touch-primary UIs (typical phones). Mouse desktops in a narrow window usually report `hover: hover`. */
export const COARSE_TOUCH_PRIMARY_MQ = '(hover: none) and (pointer: coarse)';

/**
 * Fine-pointer phones in landscape (e.g. some Android). Requires `hover: none` so the plain
 * landscape+size clause from {@link MOBILE_LAYOUT_MEDIA_QUERY} does not match mouse desktops.
 */
export const FINE_POINTER_PHONE_LANDSCAPE_MQ =
  '(hover: none) and (pointer: fine) and (orientation: landscape) and (max-height: 520px) and (max-width: 960px)';

export function matchesMobileLayout(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia(MOBILE_LAYOUT_MEDIA_QUERY).matches
  );
}
