import { prisma } from "@/lib/prisma";
import { wordStatus } from "@/lib/sm2";
import { getCurrentUser } from "@/lib/auth";
import { SearchBar } from "@/components/library/SearchBar";
import { LibraryList } from "@/components/library/LibraryList";
import { AuthGate } from "@/components/auth/AuthGate";
import { BookOpen, Sparkles } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const user = await getCurrentUser();
  if (!user) return <AuthGate />;

  const q = searchParams.q?.trim() ?? "";

  const words = await prisma.word.findMany({
    where: {
      userId: user.id,
      ...(q
        ? {
            OR: [
              { phrase: { contains: q } },
              { definition: { contains: q } },
              { sentence: { contains: q } },
            ],
          }
        : {}),
    },
    include: { review: true },
    orderBy: { createdAt: "desc" },
  });

  const total = await prisma.word.count({ where: { userId: user.id } });
  const learned = await prisma.word.count({
    where: {
      userId: user.id,
      review: { intervalDays: { gte: 21 } },
    },
  });

  return (
    <div className="space-y-6" data-testid="library-page">
      <header className="rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-mango/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-mango-shadow">
          <BookOpen size={12} /> Library
        </span>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
          Your word bank
        </h1>
        <div className="mt-3 flex items-center gap-4 text-sm text-ink-soft">
          <span>
            <b className="text-ink">{total}</b> saved
          </span>
          <span>
            <b className="text-leaf-shadow">{learned}</b> learned
          </span>
        </div>
      </header>

      <SearchBar initialQuery={q} />

      {words.length === 0 ? (
        <div
          className="relative overflow-hidden rounded-3xl border-2 border-dashed border-black/10 bg-white p-10 text-center"
          data-testid="library-empty"
        >
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand/10 text-brand animate-floaty">
            <Sparkles size={22} strokeWidth={2.5} />
          </span>
          <p className="mt-4 font-display text-xl font-bold">
            {q ? "No matches." : "Nothing here yet."}
          </p>
          <p className="mt-1 text-ink-soft">
            {q ? "Try a different word." : "Scan a page to add your first word."}
          </p>
          {!q && (
            <Link
              href="/scan"
              data-testid="library-cta-scan"
              className="btn-tactile mt-6 bg-brand shadow-tactile shadow-brand-shadow"
            >
              Scan a page
            </Link>
          )}
        </div>
      ) : (
        <LibraryList
          initialWords={words.map((word) => ({
            id: word.id,
            phrase: word.phrase,
            sentence: word.sentence,
            definition: word.definition,
            partOfSpeech: word.partOfSpeech,
            synonyms: JSON.parse(word.synonyms),
            examples: JSON.parse(word.examples),
            status: wordStatus(word.review),
          }))}
        />
      )}
    </div>
  );
}
