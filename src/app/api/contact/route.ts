import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  };

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const subject = (body.subject ?? "").trim();
  const message = (body.message ?? "").trim();

  if (
    name.length < 2 ||
    !EMAIL_RE.test(email) ||
    subject.length < 3 ||
    message.length < 10
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "Please fill every field with a real value.",
      },
      {
        status: 400,
      }
    );
  }

  await prisma.contactMessage.create({
    data: {
      name,
      email,
      subject,
      message,
    },
  });

  return NextResponse.json({
    ok: true,
  });
}