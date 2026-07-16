import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { establishSession } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  await establishSession({
    email,
    name: session.user?.name ?? "",
    picture: session.user?.image ?? null,
  });

  return NextResponse.redirect(new URL("/scan", req.url));
}
