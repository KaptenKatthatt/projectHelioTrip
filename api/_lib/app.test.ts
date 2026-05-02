import { rmSync } from "node:fs";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

type AppModule = typeof import("./app");

const TEST_BCRYPT_HASH =
  "$2b$08$6mia2yGylofyZmb5ZJHDGulXsWkv2m70bvwXJk5E1u4Oo12Fvbn/C";

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
  analyticsAdminPasswordBcrypt,
  adminSessionSecret,
}: {
  analyticsFilePath: string;
  analyticsAdminToken?: string;
  analyticsAdminPasswordBcrypt?: string;
  adminSessionSecret?: string;
}): Promise<AppModule> => {
  vi.resetModules();
  process.env.ANALYTICS_FILE = analyticsFilePath;
  process.env.ANALYTICS_ADMIN_TOKEN = analyticsAdminToken ?? "";
  process.env.ANALYTICS_ADMIN_PASSWORD_BCRYPT =
    analyticsAdminPasswordBcrypt ?? "";
  process.env.ADMIN_SESSION_SECRET = adminSessionSecret ?? "";
  process.env.SUPABASE_URL = "";
  process.env.SUPABASE_SECRET_KEY = "";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "";
  process.env.VERCEL = "";
  return import("./app");
};

const createTestApp = async (opts?: {
  analyticsAdminToken?: string;
  analyticsAdminPasswordBcrypt?: string;
  adminSessionSecret?: string;
}) => {
  const tempDir = await createTempDir();
  const { buildApp } = await loadApp({
    analyticsFilePath: path.join(tempDir, "events.json"),
    analyticsAdminToken: opts?.analyticsAdminToken,
    analyticsAdminPasswordBcrypt: opts?.analyticsAdminPasswordBcrypt,
    adminSessionSecret: opts?.adminSessionSecret,
  });
  return buildApp();
};

const extractSessionCookie = (setCookie: string | null): string => {
  expect(setCookie).toBeTruthy();
  const match = setCookie!.match(/heliotrip_admin_session=([^;]+)/);
  expect(match).toBeTruthy();
  return `heliotrip_admin_session=${match![1]}`;
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

  it("allows analytics summary after password login session", async () => {
    const app = await createTestApp({
      analyticsAdminPasswordBcrypt: TEST_BCRYPT_HASH,
      adminSessionSecret: "unit-test-session-secret-min-32-chars!!",
    });

    const blocked = await app.request("/api/analytics/summary");
    expect(blocked.status).toBe(403);

    const loginRes = await app.request("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "topsecret" }),
    });
    expect(loginRes.status).toBe(200);

    const cookie = extractSessionCookie(loginRes.headers.get("set-cookie"));
    const allowed = await app.request("/api/analytics/summary", {
      headers: { Cookie: cookie },
    });
    await expectLocalFileSummaryOk(allowed);
  });

  it("rejects wrong admin password", async () => {
    const app = await createTestApp({
      analyticsAdminPasswordBcrypt: TEST_BCRYPT_HASH,
      adminSessionSecret: "unit-test-session-secret-min-32-chars!!",
    });

    const loginRes = await app.request("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "wrong" }),
    });
    expect(loginRes.status).toBe(403);
  });

  it("returns 503 when admin login is not configured", async () => {
    const app = await createTestApp({
      analyticsAdminPasswordBcrypt: TEST_BCRYPT_HASH,
    });

    const loginRes = await app.request("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "topsecret" }),
    });
    expect(loginRes.status).toBe(503);
  });
});
