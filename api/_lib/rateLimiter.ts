// Simple in-memory rate limiter for analytics endpoint
const ANALYTICS_RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const ANALYTICS_RATE_LIMIT_MAX = 100; // 100 requests per minute per IP
const analyticsRateLimitStore = new Map<string, { count: number; resetAt: number }>();

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

const analyticsRateLimiter = (ip: string): RateLimitResult => {
  const now = Date.now();
  const entry = analyticsRateLimitStore.get(ip);

  if (!entry || now >= entry.resetAt) {
    analyticsRateLimitStore.set(ip, { count: 1, resetAt: now + ANALYTICS_RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: ANALYTICS_RATE_LIMIT_MAX - 1, resetAt: now + ANALYTICS_RATE_LIMIT_WINDOW_MS };
  }

  if (entry.count >= ANALYTICS_RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: ANALYTICS_RATE_LIMIT_MAX - entry.count, resetAt: entry.resetAt };
};

// Cleanup expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of analyticsRateLimitStore.entries()) {
    if (now >= entry.resetAt) {
      analyticsRateLimitStore.delete(key);
    }
  }
}, ANALYTICS_RATE_LIMIT_WINDOW_MS);

export { analyticsRateLimiter };
