import "server-only";
import type { Definition, DescribeFeedback } from "./types";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

// A key that just got rate-limited sits out for a bit rather than being
// retried on the very next request that rotates back around to it.
const KEY_COOLDOWN_MS = 60_000;
const keyCooldownUntil = new Map<string, number>();
let rrIndex = 0;

// Picks up GROQ_API_KEY, GROQ_API_KEY_2, GROQ_API_KEY_3, ... — as many as
// are set, no fixed cap. Each is expected to be on a separate Groq account,
// so rotating across them multiplies the effective rate limit rather than
// sharing one account-wide quota.
function getApiKeys(): string[] {
  return Object.keys(process.env)
    .filter((k) => /^GROQ_API_KEY(_\d+)?$/.test(k))
    .map((k) => process.env[k])
    .filter((v): v is string => !!v && v.trim() !== "");
}

// Round-robins the starting point across requests, and within a single
// request tries keys not currently cooling down before ones that are.
function pickOrderedKeys(): string[] {
  const keys = getApiKeys();
  if (keys.length === 0) return [];

  const start = rrIndex % keys.length;
  rrIndex++;
  const ordered = [...keys.slice(start), ...keys.slice(0, start)];

  const now = Date.now();
  const fresh = ordered.filter((k) => (keyCooldownUntil.get(k) ?? 0) <= now);
  const resting = ordered.filter((k) => (keyCooldownUntil.get(k) ?? 0) > now);
  return [...fresh, ...resting];
}

class GroqRequestError extends Error {
  retryable: boolean;
  constructor(message: string, retryable: boolean) {
    super(message);
    this.retryable = retryable;
  }
}

type GroqChatResponse = {
  choices?: { message?: { content?: string } }[];
};

async function requestGroq(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const model = process.env.GROQ_MODEL || DEFAULT_MODEL;

  let res: Response;
  try {
    res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });
  } catch {
    // Network-level failure — worth trying another key.
    throw new GroqRequestError("request_failed", true);
  }

  if (res.status === 429) {
    keyCooldownUntil.set(apiKey, Date.now() + KEY_COOLDOWN_MS);
    throw new GroqRequestError("rate_limited", true);
  }
  if (!res.ok) {
    // A bad request/response fails identically on every key, so this one
    // isn't worth burning other keys' quota retrying.
    throw new GroqRequestError("request_failed", false);
  }

  const data = (await res.json()) as GroqChatResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new GroqRequestError("malformed_response", false);
  }
  return content;
}

async function callGroqChat(systemPrompt: string, userPrompt: string): Promise<string> {
  const keys = pickOrderedKeys();
  if (keys.length === 0) {
    throw new Error("request_failed");
  }

  let lastError = new Error("request_failed");
  for (const apiKey of keys) {
    try {
      return await requestGroq(apiKey, systemPrompt, userPrompt);
    } catch (err) {
      if (!(err instanceof GroqRequestError)) throw err;
      lastError = new Error(err.message);
      if (!err.retryable) throw lastError;
      // else: try the next key
    }
  }
  throw lastError;
}

const SYSTEM_PROMPT = `You are a precise contextual dictionary. Given a word or short
phrase and the exact sentence it appears in, respond with ONLY a single
valid JSON object — no markdown, no code fences, no commentary before or
after. If any string value needs a quotation mark inside it, escape it
properly as \\" so the JSON stays valid. Schema: {"definition": string
(one clear sentence explaining the meaning AS USED in this sentence, not
a generic dictionary entry), "part_of_speech": string, "synonyms": array
of 1-3 strings, "examples": array of exactly 2 new example sentences
using the word/phrase in a similar sense, different from the source
sentence}.`;

function buildUserPrompt(phrase: string, sentence: string): string {
  return `Word or phrase: "${phrase}"\nSentence: "${sentence}"`;
}

function normalizeDefinition(parsed: Record<string, unknown>): Definition {
  const definition = String(parsed.definition ?? "").trim();
  const partOfSpeech = String(parsed.part_of_speech ?? parsed.partOfSpeech ?? "").trim();
  const synonyms = Array.isArray(parsed.synonyms) ? parsed.synonyms.map(String) : [];
  const examples = Array.isArray(parsed.examples) ? parsed.examples.map(String) : [];

  if (!definition || !partOfSpeech || examples.length === 0) {
    throw new Error("malformed_response");
  }

  return { definition, partOfSpeech, synonyms, examples };
}

function parseDefinition(raw: string): Definition {
  return normalizeDefinition(JSON.parse(raw));
}

// Retry once by trimming to the last complete `}` before giving up.
function trimToLastBrace(raw: string): string {
  const lastBrace = raw.lastIndexOf("}");
  if (lastBrace === -1) return raw;
  return raw.slice(0, lastBrace + 1);
}

export async function generateDefinition(phrase: string, sentence: string): Promise<Definition> {
  const raw = await callGroqChat(SYSTEM_PROMPT, buildUserPrompt(phrase, sentence));

  try {
    return parseDefinition(raw);
  } catch {
    try {
      return parseDefinition(trimToLastBrace(raw));
    } catch {
      throw new Error("malformed_response");
    }
  }
}

const DESCRIBE_SYSTEM_PROMPT = `You are an encouraging English speaking/writing coach reviewing a
learner's picture description. You are given a REFERENCE description of the
photo (written by a native speaker, for context only — the learner never
sees it and should not be expected to match it) and a list of target
vocabulary words the learner was encouraged to use. Compare the learner's
own description against the reference to judge coverage and accuracy, then
respond with ONLY a single valid JSON object — no markdown, no code fences,
no commentary before or after. If any string value needs a quotation mark
inside it, escape it properly as \\" so the JSON stays valid. Schema:
{"overall": string (2-3 warm, encouraging sentences summarizing how the
learner did), "strengths": array of 1-3 short strings praising specific
things the learner did well, "improvements": array of up to 4 objects
{"original": string (a short phrase or sentence from the learner's text),
"suggestion": string (a corrected or more natural version), "note": string
(one short sentence explaining why, e.g. grammar, word choice, or
naturalness)}, "missedDetails": array of up to 3 short strings naming
notable things visible in the reference description that the learner did
not mention, "vocabUsed": array of strings — which of the target vocabulary
words the learner used correctly (exact words from the provided list only)}.
If the learner's text is empty, nonsense, or unrelated to the picture, still
return valid JSON with a gentle "overall" message explaining that and empty
arrays elsewhere. Keep tone warm and specific, never harsh.`;

function buildDescribeUserPrompt(
  referenceSentences: string[],
  vocabWords: string[],
  userDescription: string
): string {
  return [
    `Reference description: "${referenceSentences.join(" ")}"`,
    `Target vocabulary: ${vocabWords.join(", ")}`,
    `Learner's description: "${userDescription}"`,
  ].join("\n");
}

function normalizeDescribeFeedback(parsed: Record<string, unknown>): DescribeFeedback {
  const overall = String(parsed.overall ?? "").trim();
  const strengths = Array.isArray(parsed.strengths) ? parsed.strengths.map(String) : [];
  const improvements = Array.isArray(parsed.improvements)
    ? parsed.improvements.map((item) => {
        const i = item as Record<string, unknown>;
        return {
          original: String(i.original ?? "").trim(),
          suggestion: String(i.suggestion ?? "").trim(),
          note: String(i.note ?? "").trim(),
        };
      })
    : [];
  const missedDetails = Array.isArray(parsed.missedDetails)
    ? parsed.missedDetails.map(String)
    : [];
  const vocabUsed = Array.isArray(parsed.vocabUsed) ? parsed.vocabUsed.map(String) : [];

  if (!overall) {
    throw new Error("malformed_response");
  }

  return { overall, strengths, improvements, missedDetails, vocabUsed };
}

function parseDescribeFeedback(raw: string): DescribeFeedback {
  return normalizeDescribeFeedback(JSON.parse(raw));
}

export async function generateDescribeFeedback(
  referenceSentences: string[],
  vocabWords: string[],
  userDescription: string
): Promise<DescribeFeedback> {
  const raw = await callGroqChat(
    DESCRIBE_SYSTEM_PROMPT,
    buildDescribeUserPrompt(referenceSentences, vocabWords, userDescription)
  );

  try {
    return parseDescribeFeedback(raw);
  } catch {
    try {
      return parseDescribeFeedback(trimToLastBrace(raw));
    } catch {
      throw new Error("malformed_response");
    }
  }
}
