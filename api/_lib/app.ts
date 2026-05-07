import { analyticsRateLimiter } from './rateLimiter.ts';

import { Hono, type Context } from 'hono';

import { cors } from 'hono/cors';
import { timingSafeEqual } from 'crypto';
import { verifyToken } from '@clerk/backend';
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
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY?.trim() ?? '';
const EPHEMERIS_CACHE_CONTROL = 'public, max-age=3600, s-maxage=86400';

const hasValidClerkToken = async (c: Context): Promise<boolean> => {
  const authHeader = c.req.header('Authorization');
  
  if (CLERK_SECRET_KEY.length === 0) return false;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  
  const token = authHeader.replace('Bearer ', '');
  try {
    const verified = await verifyToken(token, { secretKey: CLERK_SECRET_KEY });
    return !!verified;
  } catch {
    return false;
  }
};

const hasValidAnalyticsToken = (provided: string | undefined): boolean => {
  if (ANALYTICS_ADMIN_TOKEN.length === 0) return false;
  if (typeof provided !== 'string') return false;
  const expectedBuffer = Buffer.from(ANALYTICS_ADMIN_TOKEN, 'utf8');
  const providedBuffer = Buffer.from(provided, 'utf8');
  if (expectedBuffer.length !== providedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, providedBuffer);
};

const canAccessAnalyticsSummary = async (c: Context): Promise<boolean> => {
  if (await hasValidClerkToken(c)) return true;
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
    const ip = c.req.header('x-forwarded-for') ?? c.req.header('cf-connecting-ip') ?? '';
    const rateLimit = analyticsRateLimiter(ip);
    if (!rateLimit.allowed) {
      return c.json({ error: 'too_many_requests', retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000) }, 429);
    }

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



  app.get('/analytics/summary', async (c) => {
    const analyticsStore = await import('./analyticsStore.js');
    if (!(await canAccessAnalyticsSummary(c))) {
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
