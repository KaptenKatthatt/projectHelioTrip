import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const extractFrontendEventNames = (): string[] => {
  const src = readFileSync(
    path.resolve(__dirname, "../../src/lib/analytics.ts"),
    "utf8",
  );
  const match = src.match(/type AnonymousEventName\s*=\s*([\s\S]+?);/);
  if (!match)
    throw new Error(
      "Could not find AnonymousEventName type in src/lib/analytics.ts",
    );
  const names: string[] = [];
  const re = /"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(match[1])) !== null) {
    names.push(m[1]);
  }
  return names;
};

describe("analytics event name sync", () => {
  it("all frontend AnonymousEventName values are registered in the backend", async () => {
    const { isAnalyticsEventName } = await import("./analyticsStore.js");
    const frontendNames = extractFrontendEventNames();

    expect(frontendNames.length).toBeGreaterThan(0);

    const missing = frontendNames.filter((name) => !isAnalyticsEventName(name));
    expect(
      missing,
      `Frontend events not registered in api/_lib/analyticsStore.ts VALID_EVENT_NAMES: [${missing.join(", ")}]. ` +
        `Add them to both AnalyticsEventName and VALID_EVENT_NAMES.`,
    ).toEqual([]);
  });
});
