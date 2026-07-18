import { NextResponse } from "next/server";
import { generateDescribeFeedback } from "@/lib/groq";
import { getCurrentUser, subscriptionStatus } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { consumeDescribeFeedback, DESCRIBE_DAILY_LIMIT } from "@/lib/rate-limit";
import { getDescribeImage } from "@/data/describeImages";
import type { DescribeFeedbackRequest, DescribeFeedbackResult } from "@/lib/types";

const COULD_NOT_REACH = "Couldn't reach the coach right now, try again in a moment.";
const MALFORMED = "Didn't get clean feedback that time, try again?";
const RATE_LIMITED_GROQ = "Too many requests at once, give it a few seconds.";
const RATE_LIMITED_USER = `You've used today's ${DESCRIBE_DAILY_LIMIT} feedback requests, more tomorrow.`;
const MIN_LENGTH = 15;
const MAX_LENGTH = 2000;

export async function POST(request: Request) {
  let body: Partial<DescribeFeedbackRequest>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<DescribeFeedbackResult>(
      { ok: false, error: COULD_NOT_REACH },
      { status: 400 }
    );
  }

  const imageId = body.imageId?.trim();
  const description = body.description?.trim();

  if (!imageId || !description) {
    return NextResponse.json<DescribeFeedbackResult>(
      { ok: false, error: "Write a description first." },
      { status: 400 }
    );
  }
  if (description.length < MIN_LENGTH) {
    return NextResponse.json<DescribeFeedbackResult>(
      { ok: false, error: "A little more detail first — try a full sentence or two." },
      { status: 400 }
    );
  }
  if (description.length > MAX_LENGTH) {
    return NextResponse.json<DescribeFeedbackResult>(
      { ok: false, error: "That's a lot — keep it under 2000 characters." },
      { status: 400 }
    );
  }

  const image = getDescribeImage(imageId);
  if (!image) {
    return NextResponse.json<DescribeFeedbackResult>(
      { ok: false, error: "Couldn't find that picture." },
      { status: 404 }
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json<DescribeFeedbackResult>(
      { ok: false, error: "Sign in to get feedback.", code: "unauthorized" },
      { status: 401 }
    );
  }
  const sub = subscriptionStatus(user);
  if (!sub.isActive) {
    return NextResponse.json<DescribeFeedbackResult>(
      { ok: false, error: "Your trial ended, subscribe to keep practicing.", code: "subscription_required" },
      { status: 402 }
    );
  }

  const rl = await consumeDescribeFeedback(user.id);
  const rlHeaders = {
    "x-ratelimit-limit": String(rl.limit),
    "x-ratelimit-remaining": String(rl.remaining),
  };
  if (!rl.ok) {
    return NextResponse.json<DescribeFeedbackResult>(
      { ok: false, error: RATE_LIMITED_USER, code: "daily_limit" },
      { status: 429, headers: rlHeaders }
    );
  }

  try {
    const vocabWords = image.vocab.map((v) => v.phrase);
    const data = await generateDescribeFeedback(image.sentences, vocabWords, description);

    await prisma.describeAttempt.create({
      data: {
        userId: user.id,
        imageId: image.id,
        description,
        feedback: JSON.stringify(data),
      },
    });

    return NextResponse.json<DescribeFeedbackResult>({ ok: true, data }, { headers: rlHeaders });
  } catch (err) {
    const code = err instanceof Error ? err.message : "request_failed";

    if (code === "rate_limited") {
      return NextResponse.json<DescribeFeedbackResult>(
        { ok: false, error: RATE_LIMITED_GROQ },
        { status: 429, headers: rlHeaders }
      );
    }
    if (code === "malformed_response") {
      return NextResponse.json<DescribeFeedbackResult>(
        { ok: false, error: MALFORMED },
        { status: 502, headers: rlHeaders }
      );
    }
    return NextResponse.json<DescribeFeedbackResult>(
      { ok: false, error: COULD_NOT_REACH },
      { status: 502, headers: rlHeaders }
    );
  }
}
