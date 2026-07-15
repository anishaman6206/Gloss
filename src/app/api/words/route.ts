import { NextResponse } from "next/server";
import { saveWord } from "@/lib/actions";
import type { Definition } from "@/lib/types";

type SaveWordBody = { phrase: string; sentence: string } & Definition;

export async function POST(request: Request) {
  let body: Partial<SaveWordBody>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const { phrase, sentence, definition, partOfSpeech, synonyms, examples } = body;
  if (
    !phrase?.trim() ||
    !sentence?.trim() ||
    !definition ||
    !partOfSpeech ||
    !Array.isArray(synonyms) ||
    !Array.isArray(examples)
  ) {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const result = await saveWord({ phrase, sentence, definition, partOfSpeech, synonyms, examples });

  if (!result.ok) {
    const status = result.error === "unauthorized" ? 401 : 402;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result);
}
