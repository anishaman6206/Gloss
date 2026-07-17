import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

function secret(): string {
  const value = process.env.NEXTAUTH_SECRET;
  if (!value) throw new Error("NEXTAUTH_SECRET is not set");
  return value;
}

function sign(userId: string): string {
  return createHmac("sha256", secret()).update(userId).digest("hex");
}

export function signUnsubscribeToken(userId: string): string {
  return `${userId}.${sign(userId)}`;
}

export function verifyUnsubscribeToken(token: string): string | null {
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;

  const userId = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  const expected = sign(userId);

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  return userId;
}
