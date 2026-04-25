import { timingSafeEqual } from 'crypto';

const ANALYTICS_ADMIN_TOKEN = process.env.ANALYTICS_ADMIN_TOKEN?.trim() ?? '';
const hasValidToken = (provided: string | undefined): boolean => {
  if (ANALYTICS_ADMIN_TOKEN.length === 0 || !provided) return false;
  const expected = Buffer.from(ANALYTICS_ADMIN_TOKEN, 'utf8');
  const received = Buffer.from(provided, 'utf8');
  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
};

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

type NodeRequest = {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
};

type NodeResponse = {
  status: (code: number) => NodeResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
};

const readHeader = (
  headers: NodeRequest['headers'],
  key: string,
): string | undefined => {
  const raw = headers?.[key.toLowerCase()];
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw)) return raw[0];
  return undefined;
};

export default async function handler(
  req: NodeRequest,
  res: NodeResponse,
): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const token = readHeader(req.headers, 'x-analytics-token')?.trim();
  if (!hasValidToken(token)) {
    res.status(403).json({ error: 'forbidden' });
    return;
  }

  try {
    const analyticsStore = await import('../_lib/analyticsStore.js');
    const summary = await withTimeout(
      analyticsStore.readAnalyticsSummary(),
      SUMMARY_TIMEOUT_MS,
    );
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json(summary);
    return;
  } catch (error) {
    console.error('Failed to read analytics summary', error);
    if (error instanceof Error && error.message === 'summary_timeout') {
      res.status(504).json({ error: 'upstream_timeout' });
      return;
    }
    res.status(500).json({ error: 'internal' });
    return;
  }
}
