import { createHmac, timingSafeEqual } from 'node:crypto';

export const ADMIN_SESSION_COOKIE = 'heliotrip_admin_session';

const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000;

export const createAdminSessionValue = (secret: string): string => {
  const exp = Date.now() + SESSION_MAX_AGE_MS;
  const payload = Buffer.from(JSON.stringify({ exp }), 'utf8').toString(
    'base64url',
  );
  const sig = createHmac('sha256', secret)
    .update(payload)
    .digest('base64url');
  return `${payload}.${sig}`;
};

export const verifyAdminSessionValue = (
  raw: string | undefined,
  secret: string,
): boolean => {
  if (!raw || !secret) return false;
  const dot = raw.indexOf('.');
  if (dot <= 0) return false;
  const payload = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  const expectedSig = createHmac('sha256', secret)
    .update(payload)
    .digest('base64url');
  const a = Buffer.from(sig, 'base64url');
  const b = Buffer.from(expectedSig, 'base64url');
  if (a.length !== b.length) return false;
  if (!timingSafeEqual(a, b)) return false;
  let parsed: { exp?: number };
  try {
    parsed = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8'),
    ) as { exp?: number };
  } catch {
    return false;
  }
  if (typeof parsed.exp !== 'number' || Date.now() > parsed.exp) return false;
  return true;
};

export const adminSessionMaxAgeSec = (): number =>
  Math.floor(SESSION_MAX_AGE_MS / 1000);
