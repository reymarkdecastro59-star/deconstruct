// Sliding-window in-memory rate limiter (per serverless instance).
// Reliable for dev and light production; swap for Upstash Redis under heavy load.
const store = new Map<string, number[]>();

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const timestamps = (store.get(key) ?? []).filter((t) => now - t < windowMs);

  if (timestamps.length >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  timestamps.push(now);
  store.set(key, timestamps);
  return { allowed: true, remaining: maxRequests - timestamps.length };
}
