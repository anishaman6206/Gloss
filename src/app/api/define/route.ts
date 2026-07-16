import { NextResponse } from "next/server";
import { generateDefinition } from "@/lib/groq";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ANON_DAILY_LIMIT, consumeAnonDefine, getClientIp } from "@/lib/rate-limit";
import type { DefineRequest, DefineResult, Definition } from "@/lib/types";

const COULD_NOT_REACH = "Couldn't reach the dictionary right now, try again in a moment.";
const MALFORMED = "Didn't get a clean answer for that one, try again?";
const RATE_LIMITED_GROQ = "Too many lookups at once, give it a few seconds.";
const RATE_LIMITED_ANON = `Free lookups (${ANON_DAILY_LIMIT}/day) used up, sign in for unlimited.`;

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

  const user = await getCurrentUser();

  // Already saved this phrase? Reuse the stored definition instead of
  // spending an LLM call on a word we already have the answer for.
  if (user) {
    const existing = await prisma.word.findFirst({
      where: { userId: user.id, phrase: { equals: phrase, mode: "insensitive" } },
      select: { id: true, definition: true, partOfSpeech: true, synonyms: true, examples: true },
    });
    if (existing) {
      const data: Definition = {
        definition: existing.definition,
        partOfSpeech: existing.partOfSpeech,
        synonyms: JSON.parse(existing.synonyms),
        examples: JSON.parse(existing.examples),
      };
      return NextResponse.json<DefineResult>({ ok: true, data, savedWordId: existing.id });
    }
  }

  // Anon rate-limit: 40/day per IP. Signed-in users bypass entirely.
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
    return NextResponse.json<DefineResult>({ ok: true, data, savedWordId: null }, { headers: rlHeaders });
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
