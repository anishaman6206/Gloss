import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { isCashfreeConfigured, cashfreeMode, PLANS, type PlanKey } from "@/lib/cashfree/client";
import { createOrder } from "@/lib/cashfree/orders";

export async function POST(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  if (!isCashfreeConfigured()) {
    return NextResponse.json(
      { ok: false, error: "cashfree_not_configured" },
      { status: 501 }
    );
  }

  const { plan } = (await req.json().catch(() => ({}))) as { plan?: PlanKey };
  if (!plan || !(plan in PLANS)) {
    return NextResponse.json({ ok: false, error: "invalid_plan" }, { status: 400 });
  }

  const { orderId, paymentSessionId } = await createOrder(user, plan);

  return NextResponse.json({
    ok: true,
    orderId,
    paymentSessionId,
    plan,
    mode: cashfreeMode(),
  });
}
