import { rmSync } from "node:fs";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

type AppModule = typeof import("./app");



const ORIGINAL_ENV = { ...process.env };
const tempDirs: string[] = [];
const createTempDir = async (): Promise<string> => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "heliotrip-app-"));
  tempDirs.push(tempDir);
  return tempDir;
};

const postAnalyticsEvent = (
  app: {
    request: (
      input: string,
      init?: RequestInit,
    ) => Response | Promise<Response>;
  },
  body: Record<string, unknown>,
) => {
  return Promise.resolve(
    app.request("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
};

const loadApp = async ({
  analyticsFilePath,
  analyticsAdminToken,
}: {
  analyticsFilePath: string;
  analyticsAdminToken?: string;
}): Promise<AppModule> => {
  vi.resetModules();
  process.env.ANALYTICS_FILE = analyticsFilePath;
  process.env.ANALYTICS_ADMIN_TOKEN = analyticsAdminToken ?? "";
  process.env.CLERK_SECRET_KEY = "sk_test_mock";
  process.env.SUPABASE_URL = "";
  process.env.SUPABASE_SECRET_KEY = "";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "";
  process.env.VERCEL = "";
  return import("./app");
};

vi.mock("@clerk/backend", () => ({
  verifyToken: vi.fn(),
}));

const createTestApp = async (opts?: {
  analyticsAdminToken?: string;
}) => {
  const tempDir = await createTempDir();
  const { buildApp } = await loadApp({
    analyticsFilePath: path.join(tempDir, "events.json"),
    analyticsAdminToken: opts?.analyticsAdminToken,
  });
  return buildApp();
};



const expectLocalFileSummaryOk = async (response: Response) => {
  expect(response.status).toBe(200);
  const payload = await response.json();
  expect(payload).toEqual(
    expect.objectContaining({
      storage: "local-file",
      byEvent: expect.any(Array),
      byDay: expect.any(Array),
    }),
  );
};

describe("analytics API routes", () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    for (const dir of tempDirs) {
      rmSync(dir, { recursive: true, force: true });
    }
    tempDirs.length = 0;
  });

  it("returns 400 for invalid analytics event payload", async () => {
    const app = await createTestApp();

    const response = await postAnalyticsEvent(app, { name: "not_valid_event" });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "invalid_event_name",
    });
  });

  it("records a valid analytics event", async () => {
    const app = await createTestApp();

    const response = await postAnalyticsEvent(app, {
      name: "play_clicked",
      payload: {},
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("protects analytics summary with token when configured", async () => {
    const app = await createTestApp({ analyticsAdminToken: "topsecret" });

    const forbidden = await app.request("/api/analytics/summary");
    expect(forbidden.status).toBe(403);
    await expect(forbidden.json()).resolves.toEqual({ error: "forbidden" });

    const allowed = await app.request("/api/analytics/summary", {
      headers: {
        "x-analytics-token": "topsecret",
      },
    });
    await expectLocalFileSummaryOk(allowed);
  });

  it("allows analytics summary with valid Clerk token", async () => {
    const { verifyToken } = await import("@clerk/backend");
    vi.mocked(verifyToken).mockResolvedValue({ sub: "user_123" } as unknown as Awaited<ReturnType<typeof verifyToken>>);

    const app = await createTestApp();
    const response = await app.request("/api/analytics/summary", {
      headers: {
        Authorization: "Bearer valid-clerk-token",
      },
    });

    await expectLocalFileSummaryOk(response);
    expect(verifyToken).toHaveBeenCalledWith("valid-clerk-token", {
      secretKey: "sk_test_mock",
    });
  });

  it("rejects analytics summary with invalid Clerk token", async () => {
    const { verifyToken } = await import("@clerk/backend");
    vi.mocked(verifyToken).mockRejectedValue(new Error("invalid token"));

    const app = await createTestApp();
    const response = await app.request("/api/analytics/summary", {
      headers: {
        Authorization: "Bearer invalid-token",
      },
    });

    expect(response.status).toBe(403);
  });
});
