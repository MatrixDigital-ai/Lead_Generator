// Simple in-memory rate limiter for API protection
// In production, use Redis for distributed rate limiting

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10; // 10 requests per minute

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return false;
  }

  if (now > entry.resetTime) {
    // Window expired, reset
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return false;
  }

  if (entry.count >= MAX_REQUESTS) {
    return true;
  }

  entry.count++;
  return false;
}

export function getRateLimitHeaders(ip: string): Record<string, string> {
  const entry = rateLimitMap.get(ip);
  const remaining = entry ? Math.max(0, MAX_REQUESTS - entry.count) : MAX_REQUESTS;
  const reset = entry ? Math.ceil((entry.resetTime - Date.now()) / 1000) : WINDOW_MS / 1000;

  return {
    'X-RateLimit-Limit': MAX_REQUESTS.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': reset.toString(),
  };
}

// Cleanup old entries periodically (prevent memory leak)
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 60 * 1000);
