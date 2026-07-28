import { useEffect } from 'react';
import { addAfterEffect, invalidate, useThree } from '@react-three/fiber';
import { consumePendingCapture, setCaptureRequestListener } from '../lib/captureBus';

type Props = {
  /**
   * Only the canvas the user is actually looking at should serve a capture;
   * the solar-system scene stays mounted behind the surface scenes.
   */
  readonly enabled?: boolean;
};

/**
 * Serves screenshot requests from inside the render loop.
 *
 * `addAfterEffect` runs once every roots have rendered but before the browser
 * composites, so the drawing buffer still holds the finished frame — including
 * everything the post-processing composer drew — without the canvas needing
 * `preserveDrawingBuffer`.
 */
export const CanvasCapture = ({ enabled = true }: Props) => {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    if (!enabled) return;

    const stopLoopHook = addAfterEffect(() => {
      const request = consumePendingCapture();
      if (!request) return;
      try {
        request.resolve(gl.domElement.toDataURL('image/jpeg', 0.8));
      } catch (error) {
        request.reject(
          error instanceof Error ? error : new Error(String(error)),
        );
      }
    });
    const stopRequestHook = setCaptureRequestListener(() => invalidate());

    return () => {
      stopLoopHook();
      stopRequestHook();
    };
  }, [enabled, gl]);

  return null;
};
