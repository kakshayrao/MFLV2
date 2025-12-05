type Bucket = {
  tokens: number;
  last: number;
};

const buckets = new Map<string, Bucket>();

// Simple token-bucket rate limiter (in-memory). NOT suitable for multi-instance production.
// For production use a shared store (Redis) and implement a proper fixed window or sliding window limiter.
export function isRateLimited(key: string, limit = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket) {
    buckets.set(key, { tokens: limit - 1, last: now });
    return false;
  }

  const elapsed = now - bucket.last;
  // Refill tokens proportional to elapsed time
  const refill = Math.floor((elapsed / windowMs) * limit);
  if (refill > 0) {
    bucket.tokens = Math.min(limit, bucket.tokens + refill);
    bucket.last = now;
  }

  if (bucket.tokens <= 0) {
    return true;
  }

  bucket.tokens -= 1;
  bucket.last = now;
  buckets.set(key, bucket);
  return false;
}

// For memory hygiene: periodically clear very old buckets
setInterval(() => {
  const now = Date.now();
  for (const [k, b] of buckets.entries()) {
    if (now - b.last > 60 * 60 * 1000) buckets.delete(k);
  }
}, 30 * 60 * 1000);
