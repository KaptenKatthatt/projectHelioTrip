// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";

const setMatchMedia = (
  matchesCoarse: boolean,
  matchesMaxWidth: boolean,
): void => {
  const impl = vi.fn().mockImplementation((query: string): MediaQueryList => {
    const matches =
      query === "(pointer: coarse)"
        ? matchesCoarse
        : query === "(max-width: 768px)"
          ? matchesMaxWidth
          : false;
    return {
      matches,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    };
  });

  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: impl,
  });
};

const setNavigatorPerfHints = (
  cores: number,
  memory: number | undefined,
): void => {
  Object.defineProperty(navigator, "hardwareConcurrency", {
    configurable: true,
    value: cores,
  });

  Object.defineProperty(navigator, "deviceMemory", {
    configurable: true,
    value: memory,
  });
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("graphicsTier", () => {
  it("detects desktop bucket and high tier on non-mobile layouts", async () => {
    vi.resetModules();
    setMatchMedia(false, false);
    setNavigatorPerfHints(8, 8);

    const mod = await import("./graphicsTier");

    expect(mod.getRuntimeDeviceBucket()).toBe("desktop");
    expect(mod.getGraphicsTier()).toBe("high");
  });

  it("caps DPR more aggressively on low tier", async () => {
    vi.resetModules();
    setMatchMedia(true, true);
    setNavigatorPerfHints(4, 3);
    Object.defineProperty(window, "devicePixelRatio", {
      configurable: true,
      value: 3,
    });

    const mod = await import("./graphicsTier");

    expect(mod.getRuntimeDeviceBucket()).toBe("mobile-low");
    expect(mod.getGraphicsTier()).toBe("low");
    expect(mod.getCanvasDprCap("low")).toBe(0.9);
  });

  it("returns lighter low preset values", async () => {
    vi.resetModules();
    setMatchMedia(true, true);
    setNavigatorPerfHints(4, 3);

    const mod = await import("./graphicsTier");
    const preset = mod.getGraphicsPreset();

    expect(preset.asteroidCount).toBe(220);
    expect(preset.antialias).toBe(false);
    expect(preset.textureAnisotropy).toBe(1);
  });
});
