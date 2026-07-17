import Link from "next/link";
import {
  User,
  Crown,
  Calendar,
  Mail,
  BookOpen,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, subscriptionStatus } from "@/lib/auth";
import { AuthGate } from "@/components/auth/AuthGate";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { SubscriptionCard } from "@/components/profile/SubscriptionCard";
import { PLANS, type PlanKey } from "@/lib/cashfree/client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    return <AuthGate />;
  }

  const sub = subscriptionStatus(user);

  const totalWords = await prisma.word.count({
    where: {
      userId: user.id,
    },
  });

  const totalReviews = await prisma.reviewLog.count({
    where: {
      userId: user.id,
    },
  });

  const statusLabel =
    sub.displayStatus === "active"
      ? "Pro subscriber"
      : sub.displayStatus === "cancelling"
      ? "Pro · cancelling"
      : sub.displayStatus === "expired"
      ? "Free · subscription expired"
      : sub.displayStatus === "trialing"
      ? `Trial · ${sub.daysLeft} day${sub.daysLeft === 1 ? "" : "s"} left`
      : "Free · trial ended";

  const statusStyle =
    sub.displayStatus === "active"
      ? "bg-leaf/15 text-leaf-shadow"
      : sub.displayStatus === "cancelling"
      ? "bg-mango/15 text-mango-shadow"
      : sub.displayStatus === "trialing"
      ? "bg-mango/15 text-mango-shadow"
      : "bg-cherry/10 text-cherry";

  const planKey = (user.planId as PlanKey | null) ?? null;
  const planMeta = planKey && planKey in PLANS ? PLANS[planKey] : null;
  const planPrice = planMeta
    ? `${planMeta.price}/${planKey === "yearly" ? "year" : "month"}`
    : null;

  return (
    <div className="space-y-6" data-testid="profile-page">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/5 md:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-brand/20 blur-3xl" />

        <div className="relative flex items-center gap-4">
          {user.picture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.picture}
              alt=""
              className="h-16 w-16 rounded-2xl border-2 border-black/5 object-cover"
              data-testid="profile-avatar"
            />
          ) : (
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand text-white shadow-tactile shadow-brand-shadow">
              <User size={26} strokeWidth={2.5} />
            </span>
          )}

          <div className="min-w-0">
            <p
              className="font-display text-2xl font-bold"
              data-testid="profile-name"
            >
              {user.name}
            </p>

            <p
              className="truncate text-sm text-ink-soft"
              data-testid="profile-email"
            >
              {user.email}
            </p>

            <span
              className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${statusStyle}`}
              data-testid="profile-status"
            >
              <Crown size={12} />
              {statusLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/5">
          <div className="text-sm font-bold uppercase tracking-wider text-brand-shadow">
            Saved words
          </div>

          <p className="mt-2 font-display text-5xl font-bold">
            {totalWords}
          </p>
        </div>

        <div className="rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/5">
          <div className="text-sm font-bold uppercase tracking-wider text-mango-shadow">
            Total reviews
          </div>

          <p className="mt-2 font-display text-5xl font-bold">
            {totalReviews}
          </p>
        </div>
      </div>

      {/* Subscription details */}
      <SubscriptionCard
        displayStatus={sub.displayStatus}
        planLabel={planMeta?.label ?? null}
        planPrice={planPrice}
        trialEndsAt={user.trialEndsAt ? user.trialEndsAt.toISOString() : null}
        daysLeft={sub.daysLeft}
        subscriptionStart={
          user.subscriptionStart ? user.subscriptionStart.toISOString() : null
        }
        currentPeriodEnd={
          user.currentPeriodEnd ? user.currentPeriodEnd.toISOString() : null
        }
        paymentStatus={user.paymentStatus}
      />

      {/* Quick links */}
      <div className="rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/5">
        <p className="text-xs font-bold uppercase tracking-wider text-ink-faint">
          Quick links
        </p>

        <ul className="mt-3 grid gap-2 md:grid-cols-2">
          <li>
            <Link
              href="/library"
              data-testid="profile-link-library"
              className="flex items-center gap-2 rounded-2xl bg-black/[0.03] px-4 py-3 text-sm font-bold hover:bg-black/[0.05]"
            >
              <BookOpen size={16} className="text-brand" />
              My library
            </Link>
          </li>

          <li>
            <Link
              href="/stats"
              data-testid="profile-link-stats"
              className="flex items-center gap-2 rounded-2xl bg-black/[0.03] px-4 py-3 text-sm font-bold hover:bg-black/[0.05]"
            >
              <Calendar size={16} className="text-mango" />
              Stats & streak
            </Link>
          </li>

          <li>
            <a
              href="mailto:gloss.ai@gmail.com"
              data-testid="profile-link-contact"
              className="flex items-center gap-2 rounded-2xl bg-black/[0.03] px-4 py-3 text-sm font-bold hover:bg-black/[0.05]"
            >
              <Mail size={16} className="text-leaf" />
              Contact support
            </a>
          </li>

          <li>
            <LogoutButton />
          </li>
        </ul>
      </div>
    </div>
  );
}