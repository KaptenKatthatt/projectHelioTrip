import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  consumePendingCapture,
  requestCanvasCapture,
  setCaptureRequestListener,
} from './captureBus';

afterEach(() => {
  vi.useRealTimers();
  consumePendingCapture();
});

describe('captureBus', () => {
  it('resolves with whatever the render loop hands back', async () => {
    const promise = requestCanvasCapture();

    const request = consumePendingCapture();
    expect(request).not.toBeNull();
    request?.resolve('data:image/jpeg;base64,abc');

    await expect(promise).resolves.toBe('data:image/jpeg;base64,abc');
  });

  it('hands the request to the first claimant only', async () => {
    const promise = requestCanvasCapture();

    const first = consumePendingCapture();
    const second = consumePendingCapture();

    expect(first).not.toBeNull();
    expect(second).toBeNull();

    first?.resolve('data:image/jpeg;base64,abc');
    await expect(promise).resolves.toBeTypeOf('string');
  });

  it('wakes the render loop so canvases drawing on demand produce a frame', () => {
    const listener = vi.fn();
    const stop = setCaptureRequestListener(listener);

    void requestCanvasCapture().catch(() => {});

    expect(listener).toHaveBeenCalledTimes(1);
    consumePendingCapture()?.reject(new Error('done'));
    stop();
  });

  /** Without this the camera button would hang whenever nothing is rendering. */
  it('rejects when no frame arrives before the timeout', async () => {
    vi.useFakeTimers();
    const promise = requestCanvasCapture(50);
    const assertion = expect(promise).rejects.toThrow(/Timed out/);

    await vi.advanceTimersByTimeAsync(60);
    await assertion;

    expect(consumePendingCapture()).toBeNull();
  });

  it('supersedes an earlier request rather than leaking it', async () => {
    const first = requestCanvasCapture();
    const assertion = expect(first).rejects.toThrow(/Superseded/);
    const second = requestCanvasCapture();

    await assertion;
    consumePendingCapture()?.resolve('data:image/jpeg;base64,second');
    await expect(second).resolves.toBe('data:image/jpeg;base64,second');
  });
});
