import { handle } from 'hono/vercel';
import { Hono } from 'hono';
import type { AnalyticsEventName } from '../_lib/analyticsStore.js';

export const runtime = 'nodejs';

const app = new Hono();
app.post('*', async (c) => {
  const analyticsStore = await import('../_lib/analyticsStore.js');
  const body = await c.req.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return c.json({ error: 'invalid_payload' }, 400);
  }

  const name = body.name;
  if (typeof name !== 'string' || !analyticsStore.isAnalyticsEventName(name)) {
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

export const POST = handle(app);
export default handle(app);
