import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 1,
  // Local cap: gravity-lab tests bypass the WebGL scene via the
  // `__HELIOTRIP_E2E__` flag, so 3 workers fit comfortably without the
  // dev-server saturation that 4+ workers would cause for the heavier
  // R3F-mounted suites.
  workers: process.env.CI ? undefined : 3,
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "on-first-retry",
    locale: "en-US",
  },
  webServer: {
    command: "npm run dev:web -- --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
    timeout: 120000,
    env: {
      VITE_DISABLE_ANALYTICS: "true",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "lab-mobile",
      use: { viewport: { width: 390, height: 844 } },
      // Only the viewport-critical Gravity-Lab tests run here; the full
      // functional surface lives in `gravity-lab.spec.ts` (chromium only).
      testMatch: "**/gravity-lab.viewport.spec.ts",
    },
    {
      name: "lab-tablet",
      use: { viewport: { width: 768, height: 1024 } },
      testMatch: "**/gravity-lab.viewport.spec.ts",
    },
  ],
});
