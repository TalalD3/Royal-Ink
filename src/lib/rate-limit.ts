/* ══════════════════════════════════════════════════════════════════════
   RATE LIMIT — a small in-memory counter (one server process).
   Used to slow down password guessing on the admin login.
   ══════════════════════════════════════════════════════════════════════ */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/** Records one attempt; returns false when the limit is reached */
export function hit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  // Forget expired entries now and then so the map can't grow forever
  if (buckets.size > 5000) buckets.forEach((b, k) => b.resetAt <= now && buckets.delete(k));
  let b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    b = { count: 0, resetAt: now + windowMs };
    buckets.set(key, b);
  }
  b.count += 1;
  return { ok: b.count <= limit, retryAfterSec: Math.ceil((b.resetAt - now) / 1000) };
}

export function reset(key: string) {
  buckets.delete(key);
}

/** The visitor's IP as seen behind the hosting proxy. The LAST entry of
    x-forwarded-for is the one the proxy added; earlier entries can be
    typed in by the visitor and are ignored. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",").map((s) => s.trim()).filter(Boolean);
  return forwarded?.[forwarded.length - 1] || headers.get("x-real-ip")?.trim() || "unknown";
}
