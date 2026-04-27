import type { AnalyticsEventName } from '../_lib/analyticsStore.js';

type NodeRequest = {
  method?: string;
  body?: unknown;
};

type NodeResponse = {
  status: (code: number) => NodeResponse;
  json: (body: unknown) => void;
};

export default async function handler(
  req: NodeRequest,
  res: NodeResponse,
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const analyticsStore = await import('../_lib/analyticsStore.js');
  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    res.status(400).json({ error: 'invalid_payload' });
    return;
  }

  const name = (body as Record<string, unknown>).name;
  if (typeof name !== 'string' || !analyticsStore.isAnalyticsEventName(name)) {
    res.status(400).json({ error: 'invalid_event_name' });
    return;
  }

  const payloadRaw = (body as Record<string, unknown>).payload;
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
  res.status(200).json({ ok: true });
}
