// Test-only seed. Creates a user, session, and a few words for the given email.
// Run with: node scripts/seed-test-user.mjs
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const email = process.argv[2] ?? "demo@gloss.app";
const name = "Demo Reader";
const token = process.argv[3] ?? "test_session_gloss_demo";

const trialEndsAt = new Date();
trialEndsAt.setDate(trialEndsAt.getDate() + 7);

const user = await prisma.user.upsert({
  where: { email },
  update: { name, subscriptionStatus: "trialing", trialEndsAt },
  create: {
    email,
    name,
    picture: null,
    subscriptionStatus: "trialing",
    trialEndsAt,
  },
});

const expiresAt = new Date();
expiresAt.setDate(expiresAt.getDate() + 7);

await prisma.session.upsert({
  where: { sessionToken: token },
  update: { userId: user.id, expiresAt },
  create: { userId: user.id, sessionToken: token, expiresAt },
});

// Seed some sample words
const SAMPLE = [
  {
    phrase: "ephemeral",
    sentence: "Their friendship proved ephemeral, fading with the season.",
    definition: "Lasting for a very short time.",
    partOfSpeech: "adjective",
    synonyms: ["fleeting", "transient", "short-lived"],
    examples: ["The joy was ephemeral, gone by morning.", "An ephemeral trend swept the campus."],
    interval: 0,
  },
  {
    phrase: "gloss",
    sentence: "She added a quick gloss in the margin explaining the term.",
    definition: "A brief note explaining the meaning of a word or passage.",
    partOfSpeech: "noun",
    synonyms: ["annotation", "note", "explanation"],
    examples: ["The professor's gloss clarified the difficult line.", "Every rare word had a gloss."],
    interval: 30,
  },
  {
    phrase: "obfuscate",
    sentence: "The lawyer tried to obfuscate the facts with legalese.",
    definition: "To make something unclear or difficult to understand.",
    partOfSpeech: "verb",
    synonyms: ["confuse", "muddle", "obscure"],
    examples: ["Don't obfuscate the issue.", "The report obfuscated the real numbers."],
    interval: 5,
  },
];

for (const w of SAMPLE) {
  const existing = await prisma.word.findFirst({ where: { userId: user.id, phrase: w.phrase } });
  if (existing) continue;
  await prisma.word.create({
    data: {
      userId: user.id,
      phrase: w.phrase,
      sentence: w.sentence,
      definition: w.definition,
      partOfSpeech: w.partOfSpeech,
      synonyms: JSON.stringify(w.synonyms),
      examples: JSON.stringify(w.examples),
      review: {
        create: {
          intervalDays: w.interval,
          repetitions: w.interval > 0 ? 3 : 0,
          nextReviewAt: new Date(),
        },
      },
    },
  });
}

// Seed some review logs for streak
for (let i = 0; i < 3; i++) {
  const d = new Date();
  d.setDate(d.getDate() - i);
  const anyWord = await prisma.word.findFirst({ where: { userId: user.id } });
  if (!anyWord) break;
  await prisma.reviewLog.create({
    data: { userId: user.id, wordId: anyWord.id, quality: 5, reviewedAt: d },
  });
}

console.log("Seeded:", { email, token });
await prisma.$disconnect();
