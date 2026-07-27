/**
 * One-shot screenshot requests for the in-app camera.
 *
 * `canvas.toDataURL()` only returns pixels while the drawing buffer is still
 * valid. Called from a click handler — an arbitrary task, long after the last
 * frame was composited — it needs `preserveDrawingBuffer: true`, which forces
 * the driver to keep and copy the back buffer on every single frame instead of
 * swapping it. That is a permanent cost on every device for a feature used a
 * handful of times per session.
 *
 * Instead the request is parked here and served from inside the render loop,
 * where the buffer is guaranteed to hold the frame that was just drawn.
 */

export type PendingCapture = {
  readonly resolve: (dataUrl: string) => void;
  readonly reject: (error: Error) => void;
};

const DEFAULT_TIMEOUT_MS = 2000;

let pending: PendingCapture | null = null;
let requestListener: (() => void) | null = null;

/**
 * Resolves with a JPEG data URL of the next rendered frame. Rejects if no
 * frame arrives in time, which happens when no canvas is currently rendering.
 */
export const requestCanvasCapture = (
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<string> =>
  new Promise<string>((resolve, reject) => {
    if (pending) {
      pending.reject(new Error('Superseded by a newer capture request.'));
      pending = null;
    }

    const timeoutId = setTimeout(() => {
      if (pending !== entry) return;
      pending = null;
      reject(new Error('Timed out waiting for a rendered frame to capture.'));
    }, timeoutMs);

    const entry: PendingCapture = {
      resolve: (dataUrl) => {
        clearTimeout(timeoutId);
        resolve(dataUrl);
      },
      reject: (error) => {
        clearTimeout(timeoutId);
        reject(error);
      },
    };

    pending = entry;
    // Wakes up canvases running on demand rather than continuously.
    requestListener?.();
  });

/** Claims the outstanding request, if any. First caller wins. */
export const consumePendingCapture = (): PendingCapture | null => {
  const entry = pending;
  pending = null;
  return entry;
};

/** Registers the hook that nudges the render loop when a request arrives. */
export const setCaptureRequestListener = (listener: () => void): (() => void) => {
  requestListener = listener;
  return () => {
    if (requestListener === listener) requestListener = null;
  };
};
