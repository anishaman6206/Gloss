import { Crown } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { PricingCards } from "@/components/pricing/PricingCards";
import { getCurrentUser, subscriptionStatus } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pricing",
};

export default async function PricingPage() {
  const user = await getCurrentUser();
  const sub = user ? subscriptionStatus(user) : null;

  return (
    <div className="space-y-6" data-testid="pricing-page">
      <PageHeader
        icon={Crown}
        eyebrow="Pricing"
        title="Simple, honest pricing."
        subtitle="Try Gloss free for 7 days. Continue for the price of a coffee."
        accent="mango"
      />

      <PricingCards
        isPaid={sub?.isPaid ?? false}
        isTrialing={sub?.isTrialing ?? false}
      />
    </div>
  );
}