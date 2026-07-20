import { prisma } from "@/lib/prisma";
import { wordStatus, isLeech, LEARNED_INTERVAL_DAYS } from "@/lib/sm2";
import { isCommonWord } from "@/lib/wordFrequency";
import { getCurrentUser, subscriptionStatus } from "@/lib/auth";
import { LibraryHeader } from "@/components/library/LibraryHeader";
import { StatsCards } from "@/components/library/StatsCards";
import { FilterToolbar } from "@/components/library/FilterToolbar";
import { LibraryDashboard } from "@/components/library/LibraryDashboard";
import { EmptyState } from "@/components/library/EmptyState";
import { AuthGate } from "@/components/auth/AuthGate";
import type { LibraryStatusFilter, LibrarySortOption, LibraryWord, WordStatus } from "@/lib/types";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const STATUS_VALUES: LibraryStatusFilter[] = ["new", "learning", "learned"];
const SORT_VALUES: LibrarySortOption[] = ["oldest", "az", "za"];
const PAGE_SIZES = [10, 25, 50, 100];

// Prisma-side status filter, used only for the paginated listing query
// (stat-card totals use the shared wordStatus() classifier directly instead,
// see below, so the "learned" threshold only lives here once).
function statusPrismaWhere(status: WordStatus): Prisma.WordWhereInput {
  if (status === "new") {
    return { OR: [{ review: null }, { review: { repetitions: 0 } }] };
  }
  if (status === "learned") {
    return { review: { repetitions: { gt: 0 }, intervalDays: { gte: LEARNED_INTERVAL_DAYS } } };
  }
  return { review: { repetitions: { gt: 0 }, intervalDays: { lt: LEARNED_INTERVAL_DAYS } } };
}

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: {
    q?: string;
    status?: string;
    tag?: string;
    sort?: string;
    page?: string;
    pageSize?: string;
  };
}) {
  const user = await getCurrentUser();
  if (!user) return <AuthGate />;

  const q = searchParams.q?.trim() ?? "";
  const status: LibraryStatusFilter = STATUS_VALUES.includes(
    searchParams.status as LibraryStatusFilter
  )
    ? (searchParams.status as LibraryStatusFilter)
    : "all";
  const tag = searchParams.tag?.trim() ?? "";
  const sort: LibrarySortOption = SORT_VALUES.includes(searchParams.sort as LibrarySortOption)
    ? (searchParams.sort as LibrarySortOption)
    : "newest";
  const pageSize = PAGE_SIZES.includes(Number(searchParams.pageSize))
    ? Number(searchParams.pageSize)
    : 25;
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);

  const conditions: Prisma.WordWhereInput[] = [{ userId: user.id }];
  if (q) {
    conditions.push({
      OR: [
        { phrase: { contains: q } },
        { definition: { contains: q } },
        { sentence: { contains: q } },
        { examples: { contains: q } },
        { tags: { contains: q } },
      ],
    });
  }
  if (tag) {
    conditions.push({ tags: { contains: `"${tag}"` } });
  }
  if (status !== "all") {
    conditions.push(statusPrismaWhere(status));
  }
  const where: Prisma.WordWhereInput = { AND: conditions };

  const orderBy: Prisma.WordOrderByWithRelationInput =
    sort === "oldest"
      ? { createdAt: "asc" }
      : sort === "az"
        ? { phrase: "asc" }
        : sort === "za"
          ? { phrase: "desc" }
          : { createdAt: "desc" };

  const [pageRows, matchingCount, totalCount, allTagsRows, allStatusRows] = await Promise.all([
    prisma.word.findMany({
      where,
      include: { review: true },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.word.count({ where }),
    prisma.word.count({ where: { userId: user.id } }),
    prisma.word.findMany({ where: { userId: user.id }, select: { tags: true } }),
    prisma.word.findMany({
      where: { userId: user.id },
      select: { review: { select: { repetitions: true, intervalDays: true } } },
    }),
  ]);

  const wordIds = pageRows.map((w) => w.id);
  const reviewLogs = wordIds.length
    ? await prisma.reviewLog.findMany({
        where: { userId: user.id, wordId: { in: wordIds } },
        orderBy: { reviewedAt: "desc" },
      })
    : [];
  const historyByWordId = new Map<string, { quality: number; reviewedAt: Date }[]>();
  for (const log of reviewLogs) {
    const list = historyByWordId.get(log.wordId) ?? [];
    if (list.length < 5) list.push({ quality: log.quality, reviewedAt: log.reviewedAt });
    historyByWordId.set(log.wordId, list);
  }

  const distinctTags = Array.from(
    new Set(allTagsRows.flatMap((r) => JSON.parse(r.tags) as string[]))
  ).sort();

  // Fixed totals independent of the current filter - the dashboard cards
  // describe the whole library, not "what's currently visible" below.
  const statCounts = allStatusRows.reduce(
    (acc, row) => {
      acc[wordStatus(row.review)] += 1;
      return acc;
    },
    { new: 0, learning: 0, learned: 0 }
  );

  const words: LibraryWord[] = pageRows.map((word) => ({
    id: word.id,
    phrase: word.phrase,
    sentence: word.sentence,
    definition: word.definition,
    partOfSpeech: word.partOfSpeech,
    synonyms: JSON.parse(word.synonyms),
    examples: JSON.parse(word.examples),
    tags: JSON.parse(word.tags),
    notes: word.notes,
    status: wordStatus(word.review),
    isLeech: isLeech(word.review),
    isCommon: isCommonWord(word.phrase),
    createdAt: word.createdAt,
    reviewHistory: historyByWordId.get(word.id) ?? [],
  }));

  const canExport = subscriptionStatus(user).isActive && totalCount > 0;

  return (
    <div className="space-y-6" data-testid="library-page">
      <LibraryHeader canExport={canExport} />

      <StatsCards
        total={totalCount}
        newCount={statCounts.new}
        learning={statCounts.learning}
        learned={statCounts.learned}
      />

      <FilterToolbar
        initial={{ q, status, tag, sort, pageSize }}
        distinctTags={distinctTags}
      />

      {totalCount === 0 ? (
        <EmptyState variant="no-words" />
      ) : words.length === 0 ? (
        <EmptyState variant="no-matches" />
      ) : (
        <LibraryDashboard
          initialWords={words}
          query={q}
          page={page}
          pageSize={pageSize}
          totalMatching={matchingCount}
        />
      )}
    </div>
  );
}
