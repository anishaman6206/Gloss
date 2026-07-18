"use client";

import { useState } from "react";
import { Loader2, Mail, Send } from "lucide-react";

type Step =
  | { phase: "editing" }
  | { phase: "confirming"; total: number }
  | { phase: "sending" }
  | { phase: "done"; sent: number; total: number; failed: number }
  | { phase: "error"; message: string };

async function postAnnounce(payload: Record<string, unknown>) {
  const res = await fetch("/api/admin/announce", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data.error ?? "Something went wrong.");
  }
  return data;
}

export function AnnouncementForm() {
  const [subject, setSubject] = useState("");
  const [heading, setHeading] = useState("");
  const [message, setMessage] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [step, setStep] = useState<Step>({ phase: "editing" });

  const fieldsValid = subject.trim() && heading.trim() && message.trim();

  async function handleReview() {
    if (!fieldsValid) return;
    try {
      const data = await postAnnounce({ subject, heading, message, ctaLabel, ctaUrl, dryRun: true });
      setStep({ phase: "confirming", total: data.total });
    } catch (err) {
      setStep({ phase: "error", message: err instanceof Error ? err.message : "Preview failed." });
    }
  }

  async function handleConfirmSend() {
    setStep({ phase: "sending" });
    try {
      const data = await postAnnounce({ subject, heading, message, ctaLabel, ctaUrl, dryRun: false });
      setStep({ phase: "done", sent: data.sent, total: data.total, failed: data.failed });
    } catch (err) {
      setStep({ phase: "error", message: err instanceof Error ? err.message : "Send failed." });
    }
  }

  return (
    <div
      className="space-y-4 rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/5"
      data-testid="announcement-form"
    >
      <div className="flex items-center gap-2">
        <Mail size={16} className="text-brand" />
        <p className="font-display text-lg font-bold">Send an announcement</p>
      </div>
      <p className="text-sm text-ink-soft">
        Emails every user with reminder emails enabled. There's a confirmation step before anything
        actually sends.
      </p>

      <div className="space-y-3">
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject line"
          disabled={step.phase !== "editing"}
          data-testid="announce-subject"
          className="w-full rounded-2xl border-2 border-transparent bg-black/[0.04] px-4 py-2.5 text-sm outline-none focus:border-brand focus:bg-white disabled:opacity-60"
        />
        <input
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          placeholder="Heading shown in the email (e.g. New: practice with pictures)"
          disabled={step.phase !== "editing"}
          data-testid="announce-heading"
          className="w-full rounded-2xl border-2 border-transparent bg-black/[0.04] px-4 py-2.5 text-sm outline-none focus:border-brand focus:bg-white disabled:opacity-60"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message body. Use a blank line between paragraphs."
          rows={5}
          disabled={step.phase !== "editing"}
          data-testid="announce-message"
          className="w-full resize-none rounded-2xl border-2 border-transparent bg-black/[0.04] px-4 py-2.5 text-sm outline-none focus:border-brand focus:bg-white disabled:opacity-60"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={ctaLabel}
            onChange={(e) => setCtaLabel(e.target.value)}
            placeholder="Button text (optional)"
            disabled={step.phase !== "editing"}
            data-testid="announce-cta-label"
            className="w-full rounded-2xl border-2 border-transparent bg-black/[0.04] px-4 py-2.5 text-sm outline-none focus:border-brand focus:bg-white disabled:opacity-60"
          />
          <input
            value={ctaUrl}
            onChange={(e) => setCtaUrl(e.target.value)}
            placeholder="Button link (optional)"
            disabled={step.phase !== "editing"}
            data-testid="announce-cta-url"
            className="w-full rounded-2xl border-2 border-transparent bg-black/[0.04] px-4 py-2.5 text-sm outline-none focus:border-brand focus:bg-white disabled:opacity-60"
          />
        </div>
      </div>

      {step.phase === "editing" && (
        <button
          onClick={handleReview}
          disabled={!fieldsValid}
          data-testid="announce-review"
          className="btn-tactile bg-brand shadow-tactile shadow-brand-shadow disabled:opacity-40"
        >
          Review recipients
        </button>
      )}

      {step.phase === "confirming" && (
        <div className="space-y-3 rounded-2xl bg-mango/10 p-4">
          <p className="text-sm font-bold text-mango-shadow">
            This will email <b>{step.total}</b> user{step.total === 1 ? "" : "s"}. Send it?
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleConfirmSend}
              data-testid="announce-confirm"
              className="btn-tactile bg-brand !py-2.5 !px-4 text-sm shadow-tactile shadow-brand-shadow"
            >
              <Send size={14} /> Yes, send to {step.total}
            </button>
            <button
              onClick={() => setStep({ phase: "editing" })}
              data-testid="announce-cancel"
              className="btn-tactile !bg-white !text-ink border-2 border-black/10 !py-2.5 !px-4 text-sm shadow-tactile shadow-black/10"
            >
              Back to editing
            </button>
          </div>
        </div>
      )}

      {step.phase === "sending" && (
        <p className="inline-flex items-center gap-2 text-sm font-bold text-ink-soft">
          <Loader2 size={14} className="animate-spin" /> Sending…
        </p>
      )}

      {step.phase === "done" && (
        <div className="rounded-2xl bg-leaf/10 p-4 text-sm font-bold text-leaf-shadow" data-testid="announce-result">
          Sent to {step.sent} of {step.total} users
          {step.failed > 0 ? ` (${step.failed} failed — check server logs)` : ""}.
        </div>
      )}

      {step.phase === "error" && (
        <p className="text-sm font-bold text-cherry" data-testid="announce-error">
          {step.message}
        </p>
      )}
    </div>
  );
}
