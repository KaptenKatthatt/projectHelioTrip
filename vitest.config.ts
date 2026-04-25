import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["api/**/*.test.ts", "src/**/*.test.{ts,tsx}"],
    globals: true,
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
  },
});
