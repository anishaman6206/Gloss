import "server-only";
import { headers } from "next/headers";
import { prisma } from "./prisma";

export const ANON_DAILY_LIMIT = 40;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Best-effort client IP extraction. Vercel sets x-forwarded-for. */
export function getClientIp(): string {
  const h = headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return h.get("x-real-ip") ?? "unknown";
}

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  limit: number;
  used: number;
};

/**
 * Consume one define lookup for `ip`. Returns whether the request is allowed
 * and how many are left today. Uses an atomic upsert so concurrent requests
 * from the same IP can't slip through the cap.
 */
export async function consumeAnonDefine(ip: string): Promise<RateLimitResult> {
  const date = todayKey();

  // Read current count first
  const existing = await prisma.defineRateLimit.findUnique({
    where: { ip_date: { ip, date } },
  });

  if (existing && existing.count >= ANON_DAILY_LIMIT) {
    return {
      ok: false,
      remaining: 0,
      limit: ANON_DAILY_LIMIT,
      used: existing.count,
    };
  }

  const updated = await prisma.defineRateLimit.upsert({
    where: { ip_date: { ip, date } },
    create: { ip, date, count: 1 },
    update: { count: { increment: 1 } },
  });

  return {
    ok: updated.count <= ANON_DAILY_LIMIT,
    remaining: Math.max(0, ANON_DAILY_LIMIT - updated.count),
    limit: ANON_DAILY_LIMIT,
    used: updated.count,
  };
}

export const DESCRIBE_DAILY_LIMIT = 20;

/**
 * Consume one picture-description feedback request for `userId`. Same
 * atomic upsert shape as consumeAnonDefine, keyed by user instead of IP
 * since this feature always requires a signed-in, subscribed user.
 */
export async function consumeDescribeFeedback(userId: string): Promise<RateLimitResult> {
  const date = todayKey();

  const existing = await prisma.describeRateLimit.findUnique({
    where: { userId_date: { userId, date } },
  });

  if (existing && existing.count >= DESCRIBE_DAILY_LIMIT) {
    return {
      ok: false,
      remaining: 0,
      limit: DESCRIBE_DAILY_LIMIT,
      used: existing.count,
    };
  }

  const updated = await prisma.describeRateLimit.upsert({
    where: { userId_date: { userId, date } },
    create: { userId, date, count: 1 },
    update: { count: { increment: 1 } },
  });

  return {
    ok: updated.count <= DESCRIBE_DAILY_LIMIT,
    remaining: Math.max(0, DESCRIBE_DAILY_LIMIT - updated.count),
    limit: DESCRIBE_DAILY_LIMIT,
    used: updated.count,
  };
}
