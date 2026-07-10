import { prisma } from "@/lib/prisma";
import { wordStatus } from "@/lib/sm2";
import { SearchBar } from "@/components/library/SearchBar";
import { WordCard } from "@/components/library/WordCard";

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q?.trim() ?? "";

  const words = await prisma.word.findMany({
    where: q
      ? {
          OR: [
            { phrase: { contains: q } },
            { definition: { contains: q } },
            { sentence: { contains: q } },
          ],
        }
      : undefined,
    include: { review: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Your library</h1>
        <p className="text-sm text-ink/60">Every word you&apos;ve saved, in one place.</p>
      </div>

      <SearchBar initialQuery={q} />

      {words.length === 0 ? (
        <p className="pt-8 text-center text-sm text-ink/50">
          {q ? "No words match that search." : "Nothing saved yet — scan a page to start."}
        </p>
      ) : (
        <div className="space-y-3">
          {words.map((word) => (
            <WordCard
              key={word.id}
              phrase={word.phrase}
              sentence={word.sentence}
              definition={word.definition}
              partOfSpeech={word.partOfSpeech}
              synonyms={JSON.parse(word.synonyms)}
              examples={JSON.parse(word.examples)}
              status={wordStatus(word.review)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
