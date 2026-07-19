"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Camera, ArrowRight, Zap, Check } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { PLANS } from "@/lib/planPricing";
import { BrowserMockup } from "./mockups/BrowserMockup";
import { WordPopupMockup } from "./mockups/WordPopupMockup";
import { SavedConfirmationMockup } from "./mockups/SavedConfirmationMockup";

const TRUST_ITEMS = [
  "Scan & define, always free",
  `Save & review from ${PLANS.monthly.price}/month`,
  "7-day free trial",
  "Tap multiple words at once",
  "Privacy-first OCR",
];

export function Hero() {
  const { user, login, loading } = useAuth();
  const heroRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -28]);

  return (
    <section
      ref={heroRef}
      data-testid="landing-hero"
      className="grid w-full items-center gap-10 lg:grid-cols-[0.82fr_1fr] lg:gap-14"
    >
      {/* Left: copy */}
      <div className="text-center lg:text-left">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-leaf/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-leaf-shadow">
          <Zap size={12} /> Scan & define · always free
        </span>

        <h1 className="mx-auto mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl lg:mx-0 xl:text-6xl">
          Learn every word
          <br />
          <span className="text-brand">you actually read.</span>
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-lg text-ink-soft md:text-xl lg:mx-0">
          Snap a page. Tap a word. Get its meaning{" "}
          <em className="rounded bg-mango/25 px-1 not-italic">in context</em>, then keep
          it forever with spaced repetition.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
          <Link
            href="/scan"
            data-testid="cta-scan-free"
            className="btn-tactile w-full bg-brand text-lg shadow-tactile shadow-brand-shadow sm:w-auto"
          >
            <Camera size={18} /> Scan a page · free
          </Link>
          {loading ? (
            <span
              aria-hidden="true"
              className="btn-tactile invisible w-full border-2 border-black/10 shadow-tactile shadow-black/10 sm:w-auto"
            >
              <ArrowRight size={18} /> Open my library
            </span>
          ) : user ? (
            <Link
              href="/library"
              data-testid="cta-open-library"
              className="btn-tactile w-full !bg-white !text-ink border-2 border-black/10 shadow-tactile shadow-black/10 hover:bg-black/[0.02] sm:w-auto"
            >
              Open my library
            </Link>
          ) : (
            <button
              onClick={login}
              data-testid="cta-start-trial"
              className="btn-tactile w-full !bg-white !text-ink border-2 border-black/10 shadow-tactile shadow-black/10 hover:bg-black/[0.02] sm:w-auto"
            >
              <ArrowRight size={18} /> Sign in · save words
            </button>
          )}
        </div>

        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-ink-soft lg:justify-start">
          {TRUST_ITEMS.map((item) => (
            <li key={item} className="inline-flex items-center gap-1.5">
              <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-leaf/20 text-leaf-shadow">
                <Check size={10} strokeWidth={3} />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Right: layered product story (desktop only - unchanged) */}
      <div
        className="relative mx-auto hidden w-full max-w-lg py-6 lg:block"
        aria-hidden="true"
      >
        <motion.div className="relative z-10" style={{ y: parallaxY }}>
          <div
            className={reduceMotion ? "" : "animate-floaty"}
            style={{ animationDuration: "8s" }}
          >
            <BrowserMockup />
          </div>
        </motion.div>

        {/* Definition popup: slides in shortly after the browser settles */}
        <motion.div
          className="absolute -bottom-6 -right-3 z-20 w-[72%] sm:-right-4"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6, ease: "easeOut" }}
        >
          <div
            className={`relative drop-shadow-[0_25px_45px_rgba(28,176,246,0.35)] ${
              reduceMotion ? "" : "animate-floaty"
            }`}
            style={{ animationDuration: "6.5s", animationDelay: "1s" }}
          >
            <WordPopupMockup />
          </div>

          {/* Saved confirmation: rises as a toast above the popup - it never
              covers the popup's content, only the empty space above it. */}
          {reduceMotion ? (
            <div className="absolute -top-14 right-2 z-30 w-[64%] max-w-[190px] drop-shadow-[0_15px_25px_rgba(88,204,2,0.25)] sm:right-3">
              <SavedConfirmationMockup />
            </div>
          ) : (
            <motion.div
              className="absolute -top-3 right-2 z-30 w-[64%] max-w-[190px] drop-shadow-[0_15px_25px_rgba(88,204,2,0.25)] sm:right-3"
              initial={{ opacity: 0, y: 0, scale: 0.95 }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: [0, -44, -44, -58],
                scale: [0.95, 1, 1, 1],
              }}
              transition={{
                delay: 1.4,
                duration: 3.4,
                times: [0, 0.12, 0.78, 1],
                ease: ["easeOut", "linear", "easeIn"],
                repeat: Infinity,
                repeatDelay: 2.2,
              }}
            >
              <SavedConfirmationMockup />
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Right, mobile/tablet: a plain vertical story, no overlap, no absolute
          positioning - a purpose-built layout, not a shrunk desktop one. */}
      <div
        className="mx-auto flex w-full max-w-xs flex-col items-center gap-4 lg:hidden"
        aria-hidden="true"
      >
        <motion.div
          className="w-[82%]"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <BrowserMockup />
        </motion.div>

        <motion.div
          className="w-[90%]"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <WordPopupMockup />
        </motion.div>

        <motion.div
          className="w-[62%]"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <SavedConfirmationMockup />
        </motion.div>
      </div>
    </section>
  );
}
