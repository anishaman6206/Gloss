// Plain constants (no "server-only") so both client components (landing
// page, pricing cards, checkout) and server code (order creation,
// subscription activation) share one source of truth for plan pricing.

export const PLANS = {
  monthly: {
    label: "Monthly",
    price: "₹39",
    suffix: "/month",
    amount: 39,
    durationMonths: 1,
  },
  yearly: {
    label: "Yearly",
    price: "₹399",
    suffix: "/year",
    amount: 399,
    durationMonths: 12,
  },
} as const;

export type PlanKey = keyof typeof PLANS;
