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

  it("maps each tier onto the quality ladder", async () => {
    vi.resetModules();
    setMatchMedia(true, true);
    setNavigatorPerfHints(4, 3);

    const mod = await import("./graphicsTier");

    expect(mod.qualityLevelForTier("high")).toBe(0);
    expect(mod.qualityLevelForTier("medium")).toBe(2);
    expect(mod.qualityLevelForTier("low")).toBe(3);
  });

  /**
   * The preset now follows the *runtime* quality level rather than the device
   * heuristic — that is the whole point of the ladder. Boot seeding is what
   * connects the two, so the low-tier values are asserted through it.
   */
  it("seeds the runtime level from the device heuristic on a weak phone", async () => {
    vi.resetModules();
    setMatchMedia(true, true);
    setNavigatorPerfHints(4, 3);

    const { initializeQuality } = await import("./quality/initializeQuality");
    const mod = await import("./graphicsTier");

    initializeQuality();
    const preset = mod.getGraphicsPreset();

    expect(mod.getGraphicsTier()).toBe("low");
    expect(preset.asteroidCount).toBe(220);
    expect(preset.antialias).toBe(false);
    expect(preset.textureAnisotropy).toBe(1);
  });
});
