import "server-only";
import type { Definition, DescribeFeedback } from "./types";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

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

type GroqChatResponse = {
  choices?: { message?: { content?: string } }[];
};

async function callGroq(phrase: string, sentence: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("request_failed");
  }

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
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(phrase, sentence) },
        ],
      }),
    });
  } catch {
    throw new Error("request_failed");
  }

  if (res.status === 429) {
    throw new Error("rate_limited");
  }
  if (!res.ok) {
    throw new Error("request_failed");
  }

  const data = (await res.json()) as GroqChatResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("malformed_response");
  }
  return content;
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
  const raw = await callGroq(phrase, sentence);

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

async function callGroqDescribe(
  referenceSentences: string[],
  vocabWords: string[],
  userDescription: string
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("request_failed");
  }

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
          { role: "system", content: DESCRIBE_SYSTEM_PROMPT },
          {
            role: "user",
            content: buildDescribeUserPrompt(referenceSentences, vocabWords, userDescription),
          },
        ],
      }),
    });
  } catch {
    throw new Error("request_failed");
  }

  if (res.status === 429) {
    throw new Error("rate_limited");
  }
  if (!res.ok) {
    throw new Error("request_failed");
  }

  const data = (await res.json()) as GroqChatResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("malformed_response");
  }
  return content;
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
  const raw = await callGroqDescribe(referenceSentences, vocabWords, userDescription);

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
