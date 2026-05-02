import { Hono, type Context } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { cors } from 'hono/cors';
import { timingSafeEqual } from 'crypto';
import bcrypt from 'bcryptjs';
import {
  ADMIN_SESSION_COOKIE,
  adminSessionMaxAgeSec,
  createAdminSessionValue,
  verifyAdminSessionValue,
} from './adminSession.js';
import {
  fetchHorizonsVectors,
  HorizonsError,
  type HorizonsVectorResult,
} from './horizons.js';
import {
  HORIZONS_COMMAND_IDS,
  isMoonId,
  isPlanetId,
  MOON_IDS,
  MOON_META,
  PLANET_IDS,
} from './planets.js';
import type { AnalyticsEventName } from './analyticsStore.js';

type PlanetEphemerisResponse = {
  id: string;
  date: string;
  frame: 'ecliptic-j2000';
  center: 'solar-system-barycenter';
  units: 'AU';
  position: HorizonsVectorResult['position'];
  velocity: HorizonsVectorResult['velocity'];
  distance: number;
  lightTimeDays: number;
};

type MoonEphemerisResponse = {
  id: string;
  parent: string;
  date: string;
  frame: 'ecliptic-j2000';
  center: 'parent-planet';
  units: 'AU';
  position: HorizonsVectorResult['position'];
  velocity: HorizonsVectorResult['velocity'];
  distance: number;
  lightTimeDays: number;
};

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const parseDate = (raw: string | undefined): Date | null => {
  if (!raw) return new Date();
  if (!ISO_DATE_RE.test(raw)) return null;
  const d = new Date(`${raw}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
};

const isoDay = (d: Date): string => d.toISOString().slice(0, 10);
const ANALYTICS_ADMIN_TOKEN = process.env.ANALYTICS_ADMIN_TOKEN?.trim() ?? '';
const ANALYTICS_ADMIN_PASSWORD_BCRYPT =
  process.env.ANALYTICS_ADMIN_PASSWORD_BCRYPT?.trim() ?? '';
const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET?.trim() ?? '';
const EPHEMERIS_CACHE_CONTROL = 'public, max-age=3600, s-maxage=86400';

const useSecureAdminCookie = (): boolean =>
  process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

const hasValidAnalyticsToken = (provided: string | undefined): boolean => {
  if (ANALYTICS_ADMIN_TOKEN.length === 0) return false;
  if (typeof provided !== 'string') return false;
  const expectedBuffer = Buffer.from(ANALYTICS_ADMIN_TOKEN, 'utf8');
  const providedBuffer = Buffer.from(provided, 'utf8');
  if (expectedBuffer.length !== providedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, providedBuffer);
};

const hasValidAdminSession = (c: Context): boolean => {
  if (ADMIN_SESSION_SECRET.length === 0) return false;
  const raw = getCookie(c, ADMIN_SESSION_COOKIE);
  return verifyAdminSessionValue(raw, ADMIN_SESSION_SECRET);
};

const canAccessAnalyticsSummary = (c: Context): boolean => {
  if (hasValidAdminSession(c)) return true;
  const headerToken = c.req.header('x-analytics-token')?.trim();
  return hasValidAnalyticsToken(headerToken);
};

const horizonsUpstreamResponse = (error: unknown) => {
  if (!(error instanceof HorizonsError)) return null;
  return {
    payload: { error: 'horizons_upstream', message: error.message },
    status: 502 as const,
  };
};

const respondWithEphemeris = async <T>(
  context: Context,
  resolveBody: () => Promise<T>,
) => {
  try {
    const body = await resolveBody();
    context.header('Cache-Control', EPHEMERIS_CACHE_CONTROL);
    return context.json(body);
  } catch (error) {
    const upstreamError = horizonsUpstreamResponse(error);
    if (upstreamError)
      return context.json(upstreamError.payload, upstreamError.status);
    throw error;
  }
};

export const buildApp = (): Hono => {
  const app = new Hono().basePath('/api');

  app.use('*', cors());

  app.get('/health', (c) =>
    c.json({ status: 'ok', planets: PLANET_IDS, moons: MOON_IDS }),
  );

  app.post('/analytics/event', async (c) => {
    const analyticsStore = await import('./analyticsStore.js');
    const body = await c.req.json().catch(() => null);
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return c.json({ error: 'invalid_payload' }, 400);
    }

    const name = body.name;
    if (
      typeof name !== 'string' ||
      !analyticsStore.isAnalyticsEventName(name)
    ) {
      return c.json({ error: 'invalid_event_name' }, 400);
    }

    const payloadRaw = body.payload;
    const payload =
      payloadRaw && typeof payloadRaw === 'object'
        ? (payloadRaw as Record<string, unknown>)
        : {};

    const value = analyticsStore.eventValueFromPayload(payload);
    try {
      await analyticsStore.recordAnalyticsEvent(name as AnalyticsEventName, value);
    } catch (error) {
      console.error('Failed to record analytics event', { name, value, error });
    }
    return c.json({ ok: true });
  });

  app.post('/admin/login', async (c) => {
    if (
      ANALYTICS_ADMIN_PASSWORD_BCRYPT.length === 0 ||
      ADMIN_SESSION_SECRET.length === 0
    ) {
      return c.json({ error: 'admin_auth_not_configured' }, 503);
    }

    const body = await c.req.json().catch(() => null);
    const passwordRaw =
      body &&
      typeof body === 'object' &&
      !Array.isArray(body) &&
      'password' in body
        ? (body as { password?: unknown }).password
        : undefined;
    const password =
      typeof passwordRaw === 'string' ? passwordRaw : '';

    if (
      password.length === 0 ||
      !(await bcrypt.compare(password, ANALYTICS_ADMIN_PASSWORD_BCRYPT))
    ) {
      return c.json({ error: 'forbidden' }, 403);
    }

    const token = createAdminSessionValue(ADMIN_SESSION_SECRET);
    setCookie(c, ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: useSecureAdminCookie(),
      sameSite: 'Lax',
      path: '/',
      maxAge: adminSessionMaxAgeSec(),
    });

    return c.json({ ok: true });
  });

  app.post('/admin/logout', (c) => {
    deleteCookie(c, ADMIN_SESSION_COOKIE, {
      path: '/',
    });
    return c.json({ ok: true });
  });

  app.get('/analytics/summary', async (c) => {
    const analyticsStore = await import('./analyticsStore.js');
    if (!canAccessAnalyticsSummary(c)) {
      return c.json({ error: 'forbidden' }, 403);
    }
    try {
      const summary = await analyticsStore.readAnalyticsSummary();
      c.header('Cache-Control', 'no-store');
      return c.json(summary);
    } catch (error) {
      console.error('Failed to read analytics summary', error);
      return c.json({ error: 'internal' }, 500);
    }
  });

  app.get('/planets/:id', async (c) => {
    const id = c.req.param('id').toLowerCase();
    if (!isPlanetId(id)) {
      return c.json(
        { error: 'unknown_planet', validIds: PLANET_IDS },
        400,
      );
    }

    const date = parseDate(c.req.query('date'));
    if (!date) {
      return c.json(
        { error: 'invalid_date', hint: 'Use YYYY-MM-DD' },
        400,
      );
    }

    return respondWithEphemeris(c, async () => {
      const vectors = await fetchHorizonsVectors({
        commandId: HORIZONS_COMMAND_IDS[id],
        date,
      });

      return {
        id,
        date: isoDay(date),
        frame: 'ecliptic-j2000',
        center: 'solar-system-barycenter',
        units: 'AU',
        position: vectors.position,
        velocity: vectors.velocity,
        distance: vectors.distanceAu,
        lightTimeDays: vectors.lightTimeDays,
      } satisfies PlanetEphemerisResponse;
    });
  });

  app.get('/moons/:id', async (c) => {
    const id = c.req.param('id').toLowerCase();
    if (!isMoonId(id)) {
      return c.json(
        { error: 'unknown_moon', validIds: MOON_IDS },
        400,
      );
    }

    const date = parseDate(c.req.query('date'));
    if (!date) {
      return c.json(
        { error: 'invalid_date', hint: 'Use YYYY-MM-DD' },
        400,
      );
    }

    const meta = MOON_META[id];
    const parentCommand = HORIZONS_COMMAND_IDS[meta.parent];

    return respondWithEphemeris(c, async () => {
      const vectors = await fetchHorizonsVectors({
        commandId: meta.commandId,
        date,
        center: `500@${parentCommand}`,
      });

      return {
        id,
        parent: meta.parent,
        date: isoDay(date),
        frame: 'ecliptic-j2000',
        center: 'parent-planet',
        units: 'AU',
        position: vectors.position,
        velocity: vectors.velocity,
        distance: vectors.distanceAu,
        lightTimeDays: vectors.lightTimeDays,
      } satisfies MoonEphemerisResponse;
    });
  });

  return app;
};
