import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, subscriptionStatus } from "@/lib/auth";
import { toCsv } from "@/lib/csv";

const COLUMNS = ["Phrase", "Definition", "Part of Speech", "Sentence", "Synonyms"];

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const sub = subscriptionStatus(user);
  if (!sub.isActive) {
    return NextResponse.json({ ok: false, error: "subscription_required" }, { status: 403 });
  }

  const words = await prisma.word.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  const rows = words.map((word) => [
    word.phrase,
    word.definition,
    word.partOfSpeech,
    word.sentence,
    (JSON.parse(word.synonyms) as string[]).join("; "),
  ]);

  const header = [
    "#separator:Comma",
    "#html:false",
    `#columns:${COLUMNS.join(",")}`,
  ].join("\r\n");

  const csv = `${header}\r\n${toCsv(rows)}\r\n`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="gloss-export.csv"',
    },
  });
}
