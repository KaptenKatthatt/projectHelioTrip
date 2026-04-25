import { handle } from 'hono/vercel';
import { Hono } from 'hono';
import { timingSafeEqual } from 'crypto';

export const runtime = 'nodejs';

const ANALYTICS_ADMIN_TOKEN = process.env.ANALYTICS_ADMIN_TOKEN?.trim() ?? '';
const hasValidToken = (provided: string | undefined): boolean => {
  if (ANALYTICS_ADMIN_TOKEN.length === 0 || !provided) return false;
  const expected = Buffer.from(ANALYTICS_ADMIN_TOKEN, 'utf8');
  const received = Buffer.from(provided, 'utf8');
  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
};

const app = new Hono();
app.get('*', async (c) => {
  const token = c.req.header('x-analytics-token')?.trim() || undefined;
  if (!hasValidToken(token)) {
    return c.json({ error: 'forbidden' }, 403);
  }
  try {
    const analyticsStore = await import('../_lib/analyticsStore.js');
    const summary = await analyticsStore.readAnalyticsSummary();
    c.header('Cache-Control', 'no-store');
    return c.json(summary);
  } catch (error) {
    console.error('Failed to read analytics summary', error);
    return c.json({ error: 'internal' }, 500);
  }
});

export const GET = handle(app);
export default handle(app);
