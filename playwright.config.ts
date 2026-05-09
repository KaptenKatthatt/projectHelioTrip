import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 1,
  // Limit parallelism: the dev server + WebGL + 3D scene under multiple Chromium
  // pages saturates a single dev box and causes flake. CI can override via env.
  workers: process.env.CI ? undefined : 2,
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
      testMatch: "**/gravity-lab.spec.ts",
    },
    {
      name: "lab-tablet",
      use: { viewport: { width: 768, height: 1024 } },
      testMatch: "**/gravity-lab.spec.ts",
    },
  ],
});
