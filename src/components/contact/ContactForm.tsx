"use client";

import { useState } from "react";
import { Send, CheckCircle2, Loader2 } from "lucide-react";

export function ContactForm() {
  const [state, setState] = useState<{
    status: "idle" | "loading" | "done" | "error";
    msg?: string;
  }>({
    status: "idle",
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const update =
    (key: keyof typeof form) =>
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) =>
      setForm((f) => ({
        ...f,
        [key]: e.target.value,
      }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState({ status: "loading" });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        setState({ status: "done" });
        setForm({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        setState({
          status: "error",
          msg: data.error ?? "Couldn't send. Try again in a moment.",
        });
      }
    } catch {
      setState({
        status: "error",
        msg: "Network hiccup. Try again in a moment.",
      });
    }
  }

  if (state.status === "done") {
    return (
      <div
        className="relative overflow-hidden rounded-3xl border-2 border-leaf bg-white p-8 text-center shadow-tactile shadow-leaf-shadow"
        data-testid="contact-success"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-leaf/25 blur-3xl" />

        <span className="relative mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-leaf text-white shadow-tactile shadow-leaf-shadow">
          <CheckCircle2 size={26} strokeWidth={2.5} />
        </span>

        <p className="relative mt-4 font-display text-2xl font-bold">
          Message received.
        </p>

        <p className="relative mt-1 text-ink-soft">
          Thanks for writing in. We&apos;ll reply within a day. Usually sooner.
        </p>

        <button
          onClick={() => setState({ status: "idle" })}
          data-testid="contact-send-another"
          className="btn-tactile mt-5 border-2 border-black/10 !bg-white !py-2 !text-ink shadow-tactile shadow-black/10"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-3xl border-2 border-black/5 bg-white p-6 shadow-tactile shadow-black/5"
      data-testid="contact-form"
    >
      <div className="grid gap-3">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-faint">
            Name
          </span>

          <input
            required
            minLength={2}
            value={form.name}
            onChange={update("name")}
            data-testid="contact-name"
            className="mt-1 block w-full rounded-2xl border-2 border-transparent bg-black/[0.04] px-4 py-3 text-base font-medium outline-none focus:border-brand focus:bg-white"
            placeholder="Your name"
          />
        </label>

        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-faint">
            Email
          </span>

          <input
            required
            type="email"
            value={form.email}
            onChange={update("email")}
            data-testid="contact-email-input"
            className="mt-1 block w-full rounded-2xl border-2 border-transparent bg-black/[0.04] px-4 py-3 text-base font-medium outline-none focus:border-brand focus:bg-white"
            placeholder="you@example.com"
          />
        </label>

        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-faint">
            Subject
          </span>

          <input
            required
            minLength={3}
            value={form.subject}
            onChange={update("subject")}
            data-testid="contact-subject"
            className="mt-1 block w-full rounded-2xl border-2 border-transparent bg-black/[0.04] px-4 py-3 text-base font-medium outline-none focus:border-brand focus:bg-white"
            placeholder="What&rsquo;s this about?"
          />
        </label>

        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-faint">
            Message
          </span>

          <textarea
            required
            minLength={10}
            rows={5}
            value={form.message}
            onChange={update("message")}
            data-testid="contact-message"
            className="mt-1 block w-full rounded-2xl border-2 border-transparent bg-black/[0.04] px-4 py-3 text-base font-medium outline-none focus:border-brand focus:bg-white"
            placeholder="Tell us more…"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={state.status === "loading"}
        data-testid="contact-submit"
        className="btn-tactile mt-4 bg-brand shadow-tactile shadow-brand-shadow"
      >
        {state.status === "loading" ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Send size={16} />
        )}

        {state.status === "loading" ? "Sending…" : "Send message"}
      </button>

      {state.status === "error" && (
        <p
          className="mt-2 text-sm font-bold text-cherry"
          data-testid="contact-error"
        >
          {state.msg}
        </p>
      )}
    </form>
  );
}