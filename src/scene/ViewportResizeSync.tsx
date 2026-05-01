import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';

const MIN_DIM = 48;
const MAX_ASPECT = 4;

/**
 * Android Chrome can lag {@link https://github.com/pmndrs/react-use-measure react-use-measure}
 * after rotation. We nudge `setSize` from real layout — but only on viewport events, never on
 * mount: an early `getBoundingClientRect` / `clientHeight` can be far too small (e.g. DevTools
 * device mode) and locks in a huge `aspect`, flattening spheres.
 */
export const ViewportResizeSync = (): null => {
  const gl = useThree((s) => s.gl);
  const setSize = useThree((s) => s.setSize);

  useEffect(() => {
    const readSize = (): { width: number; height: number } | null => {
      const el = gl.domElement;
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w < MIN_DIM || h < MIN_DIM) return null;
      const aspect = w / h;
      if (aspect > MAX_ASPECT || aspect < 1 / MAX_ASPECT) return null;
      return { width: w, height: h };
    };

    const sync = (): void => {
      const dim = readSize();
      if (dim) setSize(dim.width, dim.height);
    };

    let orientationTimers: number[] = [];
    const onOrientationChange = (): void => {
      for (const id of orientationTimers) window.clearTimeout(id);
      orientationTimers = [50, 200].map((ms) =>
        window.setTimeout(() => {
          sync();
        }, ms),
      );
      sync();
    };

    window.visualViewport?.addEventListener('resize', sync);
    window.addEventListener('orientationchange', onOrientationChange);
    window.addEventListener('resize', sync);

    return () => {
      for (const id of orientationTimers) window.clearTimeout(id);
      window.visualViewport?.removeEventListener('resize', sync);
      window.removeEventListener('orientationchange', onOrientationChange);
      window.removeEventListener('resize', sync);
    };
  }, [gl, setSize]);

  return null;
};
