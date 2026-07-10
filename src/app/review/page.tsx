import { prisma } from "@/lib/prisma";
import { ReviewSession } from "@/components/review/ReviewSession";
import type { WordWithReview } from "@/lib/types";

export default async function ReviewPage() {
  const rows = await prisma.word.findMany({
    where: { review: { nextReviewAt: { lte: new Date() } } },
    include: { review: true },
  });

  const words: WordWithReview[] = rows
    .map((word) => ({
      id: word.id,
      phrase: word.phrase,
      sentence: word.sentence,
      definition: word.definition,
      partOfSpeech: word.partOfSpeech,
      synonyms: JSON.parse(word.synonyms),
      examples: JSON.parse(word.examples),
      createdAt: word.createdAt,
      review: word.review,
    }))
    .sort((a, b) => (a.review?.nextReviewAt.getTime() ?? 0) - (b.review?.nextReviewAt.getTime() ?? 0));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Review</h1>
        <p className="text-sm text-ink/60">Today&apos;s due words, mixed across a few quick modes.</p>
      </div>
      <ReviewSession words={words} />
    </div>
  );
}
