import "server-only";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

export const SESSION_COOKIE = "session_token";

export async function getCurrentUser() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { sessionToken: token },
    include: { user: true },
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => null);
    return null;
  }

  return session.user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthorized");
  return user;
}

export type SubStatus = {
  isActive: boolean;         // trial active OR paid active
  isTrialing: boolean;
  isPaid: boolean;
  daysLeft: number;
  status: string;
};

export function subscriptionStatus(user: {
  subscriptionStatus: string;
  trialEndsAt: Date | null;
  currentPeriodEnd: Date | null;
}): SubStatus {
  const now = new Date();
  const trialEnd = user.trialEndsAt;
  const periodEnd = user.currentPeriodEnd;

  const isTrialing =
    user.subscriptionStatus === "trialing" && !!trialEnd && trialEnd > now;
  const isPaid =
    user.subscriptionStatus === "active" && !!periodEnd && periodEnd > now;

  const activeEnd = isPaid ? periodEnd! : trialEnd ?? now;
  const daysLeft = Math.max(
    0,
    Math.ceil((activeEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );

  return {
    isActive: isTrialing || isPaid,
    isTrialing,
    isPaid,
    daysLeft,
    status: user.subscriptionStatus,
  };
}
