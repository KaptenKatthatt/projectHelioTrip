import { afterEach, describe, expect, it } from "vitest";
import {
  normalizeHostUrl,
  resolveDreiChunk,
  resolveManualChunk,
  resolvePublicSiteOrigin,
} from "./vite.config";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("resolvePublicSiteOrigin", () => {
  it("prefers explicit VITE_PUBLIC_SITE_URL", () => {
    const origin = resolvePublicSiteOrigin("production", {
      VITE_PUBLIC_SITE_URL: "https://heliotrip.example.com/",
    });
    expect(origin).toBe("https://heliotrip.example.com");
  });

  it("falls back to vercel production url", () => {
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "heliotrip.vercel.app";
    const origin = resolvePublicSiteOrigin("production", {});
    expect(origin).toBe("https://heliotrip.vercel.app");
  });

  it("throws in production when no host can be resolved", () => {
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    expect(() => resolvePublicSiteOrigin("production", {})).toThrow(
      "Absolute site URL is required for og:image",
    );
  });
});

describe("resolveManualChunk", () => {
  it("returns undefined for non-node_modules ids", () => {
    expect(resolveManualChunk("/src/main.tsx")).toBeUndefined();
  });

  it("routes react stack to vendor-react chunk", () => {
    expect(resolveManualChunk("/node_modules/react-dom/index.js")).toBe(
      "vendor-react",
    );
  });

  it("routes drei controls to dedicated chunk", () => {
    expect(
      resolveManualChunk(
        "/node_modules/@react-three/drei/core/PointerLockControls.js",
      ),
    ).toBe("vendor-drei-controls");
    expect(
      resolveDreiChunk("/node_modules/@react-three/drei/core/OrbitControls.js"),
    ).toBe("vendor-drei-controls");
  });
});

describe("normalizeHostUrl", () => {
  it("adds https scheme when missing", () => {
    expect(normalizeHostUrl("heliotrip.example.com")).toBe(
      "https://heliotrip.example.com",
    );
  });
});
