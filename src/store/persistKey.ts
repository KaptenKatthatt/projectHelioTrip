/**
 * The `localStorage` key the preference store persists under.
 *
 * Its own module so that code which needs to read a persisted preference
 * *before* the store has been constructed — texture resolution runs while
 * module-level tables are being built — can do so without importing the store
 * and dragging the whole slice graph into that path.
 */
export const PERSISTED_PREFERENCES_KEY = 'heliotrip-preferences';

/**
 * Reads one field of the persisted state straight from storage, for code
 * that runs before the store exists.
 *
 * This is deliberately the only place outside zustand-persist that knows the
 * on-disk shape (`{ state: { ... } }`). If a persist `migrate()` ever moves
 * or renames a field, this reader must move with it -- a second ad-hoc parser
 * elsewhere would keep silently returning `undefined` for users whose
 * storage predates the migration.
 */
export const readPersistedPreference = (field: string): unknown => {
  try {
    const raw = localStorage.getItem(PERSISTED_PREFERENCES_KEY);
    if (!raw) return undefined;
    const parsed: unknown = JSON.parse(raw);
    const state = (parsed as { state?: Record<string, unknown> })?.state;
    return state?.[field];
  } catch {
    // Private mode, or a shape we do not recognise.
    return undefined;
  }
};
