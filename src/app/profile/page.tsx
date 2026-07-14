import Link from "next/link";
import {
  User,
  Crown,
  Calendar,
  Mail,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, subscriptionStatus } from "@/lib/auth";
import { AuthGate } from "@/components/auth/AuthGate";
import { LogoutButton } from "@/components/auth/LogoutButton";

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

  const statusLabel = sub.isPaid
    ? "Pro subscriber"
    : sub.isTrialing
    ? `Trial · ${sub.daysLeft} day${sub.daysLeft === 1 ? "" : "s"} left`
    : "Free · trial ended";

  const statusStyle = sub.isPaid
    ? "bg-leaf/15 text-leaf-shadow"
    : sub.isTrialing
    ? "bg-mango/15 text-mango-shadow"
    : "bg-cherry/10 text-cherry";

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
      <div className="rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/5">
        <p className="text-xs font-bold uppercase tracking-wider text-ink-faint">
          Subscription
        </p>

        <div className="mt-3 space-y-2 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-ink-soft">Status</span>
            <span className="font-bold">{statusLabel}</span>
          </div>

          {sub.isTrialing && user.trialEndsAt && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-ink-soft">Trial ends</span>

              <span className="font-bold">
                {new Date(user.trialEndsAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          )}

          {sub.isPaid && user.currentPeriodEnd && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-ink-soft">Renews on</span>

              <span className="font-bold">
                {new Date(user.currentPeriodEnd).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          )}
        </div>

        {!sub.isPaid && (
          <Link
            href="/pricing"
            data-testid="profile-upgrade"
            className="btn-tactile mt-5 bg-brand shadow-tactile shadow-brand-shadow"
          >
            <Crown size={16} />
            {sub.isTrialing
              ? "Choose a plan"
              : "Reactivate subscription"}
            <ArrowRight size={16} />
          </Link>
        )}

        {sub.isPaid && (
          <div className="mt-5 space-y-2 text-sm text-ink-soft">
            <p>
              To cancel your subscription or update your payment method,
              please write to{" "}
              <a
                href="mailto:gloss.ai@gmail.com"
                className="font-bold text-brand"
              >
                gloss.ai@gmail.com
              </a>
              . We&apos;ll process it within a day.
            </p>
          </div>
        )}
      </div>

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