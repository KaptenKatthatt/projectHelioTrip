import { afterEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

// @testing-library/react's asyncWrapper checks `jestFakeTimersAreEnabled()` which
// tests for `jest` global and `setTimeout.clock`. Vitest fakes timers by adding
// `.clock` to setTimeout, but does not inject a `jest` global. Without `jest`
// defined, RTL's asyncWrapper creates a fake setTimeout that never fires,
// hanging any userEvent call. Expose vi as jest so RTL advances the clock.
(globalThis as typeof globalThis & { jest?: typeof vi }).jest ??= vi;

afterEach(() => {
  vi.restoreAllMocks();
});
