import { Hono } from 'hono';
import { cors } from 'hono/cors';
import {
  fetchHorizonsVectors,
  HorizonsError,
  type HorizonsVectorResult,
} from './horizons';
import { HORIZONS_COMMAND_IDS, isPlanetId, PLANET_IDS } from './planets';

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

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const parseDate = (raw: string | undefined): Date | null => {
  if (!raw) return new Date();
  if (!ISO_DATE_RE.test(raw)) return null;
  const d = new Date(`${raw}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
};

const isoDay = (d: Date): string => d.toISOString().slice(0, 10);

export const buildApp = (): Hono => {
  const app = new Hono().basePath('/api');

  app.use('*', cors());

  app.get('/health', (c) =>
    c.json({ status: 'ok', planets: PLANET_IDS }),
  );

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

  return app;
};
