import { NextResponse, type NextRequest } from "next/server";

type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitBucket>();
let requestsSinceCleanup = 0;

function getClientKey(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip =
    forwardedFor?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  return `${ip}:${request.nextUrl.pathname}`;
}

export function rateLimit(
  request: NextRequest,
  { limit, windowMs }: RateLimitOptions,
): NextResponse | null {
  const now = Date.now();
  const key = getClientKey(request);
  const current = buckets.get(key);
  const bucket =
    current && current.resetAt > now
      ? current
      : { count: 0, resetAt: now + windowMs };

  bucket.count += 1;
  buckets.set(key, bucket);

  requestsSinceCleanup += 1;
  if (requestsSinceCleanup >= 500) {
    for (const [bucketKey, value] of buckets) {
      if (value.resetAt <= now) buckets.delete(bucketKey);
    }
    requestsSinceCleanup = 0;
  }

  if (bucket.count <= limit) return null;

  const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
  return NextResponse.json(
    {
      error: {
        code: "RATE_LIMITED",
        message: "Terlalu banyak permintaan. Silakan coba kembali sebentar lagi.",
      },
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(Math.ceil(bucket.resetAt / 1000)),
      },
    },
  );
}
