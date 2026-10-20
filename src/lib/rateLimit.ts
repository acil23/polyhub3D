const ipTracker = new Map<string, number[]>();

export function checkRateLimit(
  ip: string,
  maxRequests = 3,
  windowMs = 10 * 60 * 1000
): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const timestamps = (ipTracker.get(ip) || []).filter((t) => now - t < windowMs);

  if (timestamps.length >= maxRequests) {
    const oldest = timestamps[0];
    const retryAfterSec = Math.ceil((windowMs - (now - oldest)) / 1000);
    return { allowed: false, retryAfterSec };
  }

  timestamps.push(now);
  ipTracker.set(ip, timestamps);
  return { allowed: true };
}
