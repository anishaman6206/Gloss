import { PricingClient } from "@/components/subscribe/PricingClient";
import { getCurrentUser, subscriptionStatus } from "@/lib/auth";
import { AuthGate } from "@/components/auth/AuthGate";

export const dynamic = "force-dynamic";

export default async function SubscribePage() {
  const user = await getCurrentUser();
  if (!user) return <AuthGate />;
  const sub = subscriptionStatus(user);

  return (
    <div className="space-y-6" data-testid="subscribe-page">
      <PricingClient
        initialSub={sub}
        userEmail={user.email}
        userName={user.name}
      />
    </div>
  );
}
