/**
 * The `localStorage` key the preference store persists under.
 *
 * Its own module so that code which needs to read a persisted preference
 * *before* the store has been constructed — texture resolution runs while
 * module-level tables are being built — can do so without importing the store
 * and dragging the whole slice graph into that path.
 */
export const PERSISTED_PREFERENCES_KEY = 'heliotrip-preferences';
