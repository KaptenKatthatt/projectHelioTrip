/**
 * Single source of truth for the landing-overlay backdrops. The HUD Suspense
 * fallbacks must match the surface components' own backgrounds exactly, or
 * the lazy-chunk load window flashes a mismatched color. Kept in a standalone
 * module so the eagerly-loaded HUD can import it without pulling the lazy
 * surface chunks into the entry graph.
 */
export const MARS_SURFACE_BG_CLASS = 'bg-[#1a0a05]';
export const MOON_SURFACE_BG_CLASS = 'bg-[#000310]';
/** Hex twin of MOON_SURFACE_BG_CLASS for the r3f scene background. */
export const MOON_SCENE_BG_COLOR = '#000310';
