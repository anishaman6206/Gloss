import "server-only";
import type { Definition } from "./types";

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
