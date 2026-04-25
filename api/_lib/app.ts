import { Hono } from 'hono';
import { cors } from 'hono/cors';
import {
  fetchHorizonsVectors,
  HorizonsError,
  type HorizonsVectorResult,
} from './horizons';
import {
  HORIZONS_COMMAND_IDS,
  isMoonId,
  isPlanetId,
  MOON_IDS,
  MOON_META,
  PLANET_IDS,
} from './planets';
import {
  eventValueFromPayload,
  isAnalyticsEventName,
  readAnalyticsSummary,
  recordAnalyticsEvent,
} from './analyticsStore';

export type PlanetEphemerisResponse = {
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

export type MoonEphemerisResponse = {
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

const hasValidAnalyticsToken = (provided: string | undefined): boolean =>
  ANALYTICS_ADMIN_TOKEN.length === 0 ||
  (typeof provided === 'string' && provided === ANALYTICS_ADMIN_TOKEN);

export const buildApp = (): Hono => {
  const app = new Hono().basePath('/api');

  app.use('*', cors());

  app.get('/health', (c) =>
    c.json({ status: 'ok', planets: PLANET_IDS, moons: MOON_IDS }),
  );

  app.post('/analytics/event', async (c) => {
    const body = await c.req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return c.json({ error: 'invalid_payload' }, 400);
    }

    const name = body.name;
    if (typeof name !== 'string' || !isAnalyticsEventName(name)) {
      return c.json({ error: 'invalid_event_name' }, 400);
    }

    const payloadRaw = body.payload;
    const payload =
      payloadRaw && typeof payloadRaw === 'object'
        ? (payloadRaw as Record<string, unknown>)
        : {};

    const value = eventValueFromPayload(payload);
    await recordAnalyticsEvent(name, value);
    return c.json({ ok: true });
  });

  app.get('/analytics/summary', async (c) => {
    const queryToken = c.req.query('token');
    const headerToken = c.req.header('x-analytics-token');
    if (!hasValidAnalyticsToken(queryToken ?? headerToken)) {
      return c.json({ error: 'forbidden' }, 403);
    }
    const summary = await readAnalyticsSummary();
    c.header('Cache-Control', 'no-store');
    return c.json(summary);
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

    try {
      const vectors = await fetchHorizonsVectors({
        commandId: HORIZONS_COMMAND_IDS[id],
        date,
      });

      const body: PlanetEphemerisResponse = {
        id,
        date: isoDay(date),
        frame: 'ecliptic-j2000',
        center: 'solar-system-barycenter',
        units: 'AU',
        position: vectors.position,
        velocity: vectors.velocity,
        distance: vectors.distanceAu,
        lightTimeDays: vectors.lightTimeDays,
      };

      c.header('Cache-Control', 'public, max-age=3600, s-maxage=86400');
      return c.json(body);
    } catch (error) {
      if (error instanceof HorizonsError) {
        return c.json(
          { error: 'horizons_upstream', message: error.message },
          502,
        );
      }
      throw error;
    }
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

    try {
      const vectors = await fetchHorizonsVectors({
        commandId: meta.commandId,
        date,
        center: `500@${parentCommand}`,
      });

      const body: MoonEphemerisResponse = {
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
      };

      c.header('Cache-Control', 'public, max-age=3600, s-maxage=86400');
      return c.json(body);
    } catch (error) {
      if (error instanceof HorizonsError) {
        return c.json(
          { error: 'horizons_upstream', message: error.message },
          502,
        );
      }
      throw error;
    }
  });

  return app;
};
