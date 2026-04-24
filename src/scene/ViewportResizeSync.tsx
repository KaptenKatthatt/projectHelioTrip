import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';

/**
 * Android Chrome often lags {@link https://github.com/pmndrs/react-use-measure react-use-measure}
 * by a frame or two after {@link window.orientationchange} / {@link VisualViewport} resizes,
 * leaving the WebGL buffer and the perspective camera aspect out of sync (squashed planets).
 */
export const ViewportResizeSync = (): null => {
  const gl = useThree((s) => s.gl);
  const setSize = useThree((s) => s.setSize);

  useEffect(() => {
    const sync = (): void => {
      const parent = gl.domElement.parentElement;
      if (!parent) return;
      const r = parent.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        setSize(r.width, r.height);
      }
    };

    window.visualViewport?.addEventListener('resize', sync);
    window.addEventListener('orientationchange', sync);
    window.addEventListener('resize', sync);

    const t0 = window.setTimeout(sync, 0);
    const t1 = window.setTimeout(sync, 100);
    const t2 = window.setTimeout(sync, 300);

    return () => {
      window.visualViewport?.removeEventListener('resize', sync);
      window.removeEventListener('orientationchange', sync);
      window.removeEventListener('resize', sync);
      window.clearTimeout(t0);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [gl, setSize]);

  return null;
};
