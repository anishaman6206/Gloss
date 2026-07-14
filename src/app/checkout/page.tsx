import { redirect } from "next/navigation";
import { getCurrentUser, subscriptionStatus } from "@/lib/auth";
import { AuthGate } from "@/components/auth/AuthGate";
import { CheckoutClient } from "@/components/subscribe/CheckoutClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Checkout",
};

type Plan = "monthly" | "yearly";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: {
    plan?: string;
  };
}) {
  const user = await getCurrentUser();

  if (!user) {
    return <AuthGate />;
  }

  const sub = subscriptionStatus(user);

  const plan = (
    searchParams.plan === "yearly" ? "yearly" : "monthly"
  ) as Plan;

  if (sub.isPaid) {
    redirect("/profile");
  }

  return (
    <CheckoutClient
      plan={plan}
      isTrialing={sub.isTrialing}
      daysLeft={sub.daysLeft}
      userEmail={user.email}
      userName={user.name}
    />
  );
}