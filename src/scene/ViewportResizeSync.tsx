import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';

const MIN_DIM = 48;
const MAX_ASPECT = 4;

/**
 * Android Chrome can lag {@link https://github.com/pmndrs/react-use-measure react-use-measure}
 * after rotation. We nudge `setSize` from real layout — but only after layout is known, never
 * from an eager mount read: an early `clientWidth` / `clientHeight` can be far off (e.g. DevTools
 * device mode) and locks in a bad `aspect`, flattening spheres.
 *
 * Chrome DevTools responsive mode often resizes the canvas element without a reliable extra
 * `window.resize`; {@link ResizeObserver} on the canvas keeps the WebGL buffer in sync.
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

    /** Run after flex/layout settles so we do not skip `setSize` on a one-frame bogus aspect. */
    let raf1 = 0;
    let raf2 = 0;
    const syncAfterLayout = (): void => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      raf1 = requestAnimationFrame(() => {
        sync();
        raf2 = requestAnimationFrame(sync);
      });
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

    const ro = new ResizeObserver(() => {
      syncAfterLayout();
    });
    ro.observe(gl.domElement);

    window.visualViewport?.addEventListener('resize', syncAfterLayout);
    window.addEventListener('orientationchange', onOrientationChange);
    window.addEventListener('resize', syncAfterLayout);

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      for (const id of orientationTimers) window.clearTimeout(id);
      ro.disconnect();
      window.visualViewport?.removeEventListener('resize', syncAfterLayout);
      window.removeEventListener('orientationchange', onOrientationChange);
      window.removeEventListener('resize', syncAfterLayout);
    };
  }, [gl, setSize]);

  return null;
};
