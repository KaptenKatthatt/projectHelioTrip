import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

const RELOAD_FLAG_PREFIX = 'heliotrip-chunk-reload:';

/**
 * React.lazy with stale-deploy recovery. When a deploy replaces hashed chunk
 * names mid-session, a pending dynamic import can 404; without handling, the
 * rejection unmounts the whole tree. On failure this reloads the page once
 * (picking up the new index.html and service worker) and otherwise resolves
 * to an empty component instead of crashing. Offline failures never reload,
 * so a missing chunk cannot cause a reload loop.
 */
const Empty: ComponentType = () => null;

export const lazyWithRecovery = (
  name: string,
  load: () => Promise<{ default: ComponentType }>,
): LazyExoticComponent<ComponentType> =>
  lazy(() =>
    load().then(
      (module) => {
        sessionStorage.removeItem(`${RELOAD_FLAG_PREFIX}${name}`);
        return module;
      },
      (error: unknown) => {
        const flag = `${RELOAD_FLAG_PREFIX}${name}`;
        if (navigator.onLine && !sessionStorage.getItem(flag)) {
          sessionStorage.setItem(flag, '1');
          window.location.reload();
        } else {
          console.error(`Failed to load chunk "${name}"`, error);
        }
        return { default: Empty };
      },
    ),
  );
