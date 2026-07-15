import { NextResponse } from "next/server";
import { generateDefinition } from "@/lib/groq";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ANON_DAILY_LIMIT, consumeAnonDefine, getClientIp } from "@/lib/rate-limit";
import type { DefineRequest, DefineResult } from "@/lib/types";

const COULD_NOT_REACH = "Couldn't reach the dictionary right now — try again in a moment.";
const MALFORMED = "Didn't get a clean answer for that one — try again?";
const RATE_LIMITED_GROQ = "Too many lookups at once — give it a few seconds.";
const RATE_LIMITED_ANON = `Free lookups (${ANON_DAILY_LIMIT}/day) used up — sign in for unlimited.`;

export async function POST(request: Request) {
  let body: Partial<DefineRequest>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<DefineResult>({ ok: false, error: COULD_NOT_REACH }, { status: 400 });
  }

  const phrase = body.phrase?.trim();
  const sentence = body.sentence?.trim();

  if (!phrase || !sentence) {
    return NextResponse.json<DefineResult>({ ok: false, error: COULD_NOT_REACH }, { status: 400 });
  }

  // Anon rate-limit: 40/day per IP. Signed-in users bypass entirely.
  const user = await getCurrentUser();
  let rlHeaders: Record<string, string> = {};
  if (!user) {
    const ip = getClientIp();
    const rl = await consumeAnonDefine(ip);
    rlHeaders = {
      "x-ratelimit-limit": String(rl.limit),
      "x-ratelimit-remaining": String(rl.remaining),
    };
    if (!rl.ok) {
      return NextResponse.json<DefineResult>(
        { ok: false, error: RATE_LIMITED_ANON, code: "anon_daily_limit" },
        { status: 429, headers: rlHeaders }
      );
    }
  }

  try {
    const data = await generateDefinition(phrase, sentence);

    let alreadySaved: boolean | undefined;
    if (user) {
      const existing = await prisma.word.findFirst({
        where: { userId: user.id, phrase: { equals: phrase, mode: "insensitive" } },
        select: { id: true },
      });
      alreadySaved = !!existing;
    }

    return NextResponse.json<DefineResult>({ ok: true, data, alreadySaved }, { headers: rlHeaders });
  } catch (err) {
    const code = err instanceof Error ? err.message : "request_failed";

    if (code === "rate_limited") {
      return NextResponse.json<DefineResult>(
        { ok: false, error: RATE_LIMITED_GROQ },
        { status: 429, headers: rlHeaders }
      );
    }
    if (code === "malformed_response") {
      return NextResponse.json<DefineResult>(
        { ok: false, error: MALFORMED },
        { status: 502, headers: rlHeaders }
      );
    }
    return NextResponse.json<DefineResult>(
      { ok: false, error: COULD_NOT_REACH },
      { status: 502, headers: rlHeaders }
    );
  }
}
