import { NextResponse } from "next/server";
import { generateDefinition } from "@/lib/groq";
import type { DefineRequest, DefineResult } from "@/lib/types";

const COULD_NOT_REACH = "Couldn't reach the dictionary right now — try again in a moment.";
const MALFORMED = "Didn't get a clean answer for that one — try again?";
const RATE_LIMITED = "Too many lookups at once — give it a few seconds.";

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

  try {
    const data = await generateDefinition(phrase, sentence);
    return NextResponse.json<DefineResult>({ ok: true, data });
  } catch (err) {
    const code = err instanceof Error ? err.message : "request_failed";

    if (code === "rate_limited") {
      return NextResponse.json<DefineResult>({ ok: false, error: RATE_LIMITED }, { status: 429 });
    }
    if (code === "malformed_response") {
      return NextResponse.json<DefineResult>({ ok: false, error: MALFORMED }, { status: 502 });
    }
    return NextResponse.json<DefineResult>({ ok: false, error: COULD_NOT_REACH }, { status: 502 });
  }
}
