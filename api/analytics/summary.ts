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
const SUMMARY_TIMEOUT_MS = 8000;

const withTimeout = async <T>(promise: Promise<T>, ms: number): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('summary_timeout')), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId !== null) clearTimeout(timeoutId);
  }
};

app.get('*', async (c) => {
  const token = c.req.header('x-analytics-token')?.trim() || undefined;
  if (!hasValidToken(token)) {
    return c.json({ error: 'forbidden' }, 403);
  }
  try {
    const analyticsStore = await import('../_lib/analyticsStore.js');
    const summary = await withTimeout(
      analyticsStore.readAnalyticsSummary(),
      SUMMARY_TIMEOUT_MS,
    );
    c.header('Cache-Control', 'no-store');
    return c.json(summary);
  } catch (error) {
    console.error('Failed to read analytics summary', error);
    if (error instanceof Error && error.message === 'summary_timeout') {
      return c.json({ error: 'upstream_timeout' }, 504);
    }
    return c.json({ error: 'internal' }, 500);
  }
});

export const GET = handle(app);
export default handle(app);
