import { useCallback, useSyncExternalStore } from "react";

/**
 * One `MediaQueryList` per distinct query, shared by every consumer.
 *
 * `window.matchMedia` allocates a fresh object on each call, and
 * `useSyncExternalStore` reads the snapshot on every render — so without this
 * cache each render of each consumer would build another one. Sharing also
 * means several components asking about the same breakpoint register one
 * listener between them rather than one each.
 */
const mediaQueryLists = new Map<string, MediaQueryList>();

/**
 * A cached list must never outlive the `matchMedia` that produced it — its
 * `matches` would keep answering for the old environment. Real browsers never
 * swap the function, but anything that does (a test harness, a polyfill
 * installed late) would otherwise be silently ignored for the rest of the
 * session, which is a stale answer rather than a slow one.
 */
let cachedMatchMedia: typeof window.matchMedia | null = null;

const getMediaQueryList = (query: string): MediaQueryList | null => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return null;
  }
  if (window.matchMedia !== cachedMatchMedia) {
    cachedMatchMedia = window.matchMedia;
    mediaQueryLists.clear();
  }
  let mql = mediaQueryLists.get(query);
  if (!mql) {
    mql = window.matchMedia(query);
    mediaQueryLists.set(query, mql);
  }
  return mql;
};

/** Server and pre-hydration answer, matching the previous implementation. */
const getServerSnapshot = (): boolean => false;

/**
 * Subscribes to a media query. Defaults to false where `matchMedia` is absent.
 *
 * Built on `useSyncExternalStore` rather than `useState` + `useEffect`: the
 * old shape seeded state during render and then re-synced it from an effect
 * on mount to cover the gap between the two, costing every consumer an extra
 * render on mount and one more on every breakpoint change. Reading the live
 * value at render time closes that gap by construction, and React takes care
 * of the tearing case the effect was there to paper over.
 */
export const useMediaQuery = (query: string): boolean => {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mql = getMediaQueryList(query);
      if (!mql) return () => undefined;
      mql.addEventListener("change", onStoreChange);
      return () => mql.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  const getSnapshot = useCallback(
    () => getMediaQueryList(query)?.matches ?? false,
    [query],
  );

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
