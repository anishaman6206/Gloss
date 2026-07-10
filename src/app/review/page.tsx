import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ReviewSession } from "@/components/review/ReviewSession";
import { AuthGate } from "@/components/auth/AuthGate";
import type { WordWithReview } from "@/lib/types";
import { Repeat2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const user = await getCurrentUser();
  if (!user) return <AuthGate />;

  const rows = await prisma.word.findMany({
    where: { userId: user.id, review: { nextReviewAt: { lte: new Date() } } },
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
    .sort(
      (a, b) =>
        (a.review?.nextReviewAt.getTime() ?? 0) - (b.review?.nextReviewAt.getTime() ?? 0)
    );

  return (
    <div className="space-y-6" data-testid="review-page">
      <header className="rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-leaf/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-leaf-shadow">
          <Repeat2 size={12} /> Review
        </span>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
          Today&apos;s words are ready.
        </h1>
        <p className="mt-1 text-ink-soft">
          Three quick modes — recall, fill‑blank, produce the word. Mixed.
        </p>
      </header>
      <ReviewSession words={words} />
    </div>
  );
}
