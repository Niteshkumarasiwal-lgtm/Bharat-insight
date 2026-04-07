"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import AuthPanel from "@/components/auth-panel";
import { DEPARTMENT_CONFIG } from "@/lib/departments";
import { useUIStore } from "@/store/ui-store";

const heroLines = [
  "Stream policy-ready insights from 100,000+ public records.",
  "Switch ministries instantly without refreshing the dashboard.",
  "Translate dense datasets into executive actions with Gemini.",
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

function SectionReveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.18 }}
      variants={fadeUp}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function StreamingHeadline() {
  const [lineIndex, setLineIndex] = useState(0);

  return (
    <div className="min-h-[60px] rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
      <span className="text-sky-300">$ insight.stream</span>{" "}
      <TypingLine
        key={heroLines[lineIndex]}
        text={heroLines[lineIndex]}
        onDone={() => {
          window.setTimeout(() => {
            setLineIndex((value) => (value + 1) % heroLines.length);
          }, 1300);
        }}
      />
    </div>
  );
}

function TypingLine({
  text,
  onDone,
}: {
  text: string;
  onDone: () => void;
}) {
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCharCount((value) => {
        const nextValue = value + 1;
        if (nextValue >= text.length) {
          window.clearInterval(interval);
          onDone();
        }
        return nextValue;
      });
    }, 28);

    return () => window.clearInterval(interval);
  }, [onDone, text]);

  return (
    <>
      {text.slice(0, charCount)}
      <span className="ml-1 inline-block h-4 w-[1px] animate-pulse bg-white/80" />
    </>
  );
}

function HeroChart() {
  const bars = [38, 55, 62, 71, 68, 86, 92];

  return (
    <div className="hero-grid relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.7),rgba(7,12,24,0.98))] p-6">
      <div className="absolute inset-x-8 top-8 h-24 rounded-full bg-sky-400/10 blur-3xl" />
      <div className="relative mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.34em] text-slate-400">
            Live Signal Preview
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-white">
            Department performance moves in real time
          </h3>
        </div>
        <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
          AI monitoring active
        </div>
      </div>
      <div className="grid grid-cols-7 items-end gap-3">
        {bars.map((height, index) => (
          <motion.div
            key={index}
            className="rounded-t-[18px] bg-gradient-to-t from-sky-500 via-cyan-300 to-white/90"
            initial={{ height: 18, opacity: 0.4 }}
            animate={{ height: `${height}%`, opacity: 1 }}
            transition={{
              duration: 0.8,
              delay: index * 0.06,
              repeat: Infinity,
              repeatType: "mirror",
              repeatDelay: 1.4,
            }}
            style={{ minHeight: 60 }}
          />
        ))}
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <div className="rounded-[22px] border border-white/10 bg-white/6 p-4">
          <p className="text-xs uppercase tracking-[0.26em] text-slate-400">
            Active Tenants
          </p>
          <p className="mt-2 text-3xl font-semibold text-white">2</p>
          <p className="mt-2 text-sm text-slate-400">
            Health and agriculture views are available out of the box.
          </p>
        </div>
        <div className="rounded-[22px] border border-white/10 bg-white/6 p-4">
          <p className="text-xs uppercase tracking-[0.26em] text-slate-400">
            Virtual Rows
          </p>
          <p className="mt-2 text-3xl font-semibold text-white">120K+</p>
          <p className="mt-2 text-sm text-slate-400">
            Smooth scrolling and keyboard navigation across dense public data.
          </p>
        </div>
        <div className="rounded-[22px] border border-white/10 bg-white/6 p-4">
          <p className="text-xs uppercase tracking-[0.26em] text-slate-400">
            Insight Loop
          </p>
          <p className="mt-2 text-3xl font-semibold text-white">Streaming</p>
          <p className="mt-2 text-sm text-slate-400">
            Gemini responses appear token by token with filter-aware context.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const tenantCards = Object.values(DEPARTMENT_CONFIG);

  return (
    <main className="min-h-screen px-4 pb-16 pt-4 text-white md:px-6">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-10">
        <SectionReveal className="surface sticky top-4 z-20 rounded-[26px] border border-white/10 px-5 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.34em] text-slate-400">
                Bharat Insight
              </p>
              <p className="mt-1 text-sm text-slate-300">
                Multi-tenant intelligence platform for Indian public data.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => useUIStore.getState().openPalette()}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
              >
                Cmd/Ctrl + K
              </button>
              <Link
                href="/dashboard"
                className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                Open Dashboard
              </Link>
            </div>
          </div>
        </SectionReveal>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
          <SectionReveal className="space-y-6">
            <div className="inline-flex rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-xs uppercase tracking-[0.34em] text-sky-200">
              Regrip Frontend Assignment Build
            </div>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-balance text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-white md:text-7xl">
                A dark, high-conviction control room for public sector analytics.
              </h1>
              <p className="max-w-2xl text-lg text-slate-300 md:text-xl">
                Bharat Insight turns large Indian public datasets into a fast,
                multi-tenant decision interface with streaming AI commentary and
                zero-refresh department switching.
              </p>
            </div>
            <StreamingHeadline />
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="rounded-full bg-white px-6 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                Explore the Dashboard
              </Link>
              <a
                href="#platform-features"
                className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                View Platform Features
              </a>
            </div>
          </SectionReveal>
          <SectionReveal>
            <HeroChart />
          </SectionReveal>
        </section>

        <section id="platform-features" className="grid gap-4 lg:grid-cols-12">
          <SectionReveal className="grid-glow surface col-span-12 rounded-[30px] border border-white/10 p-6 lg:col-span-5">
            <p className="text-xs uppercase tracking-[0.34em] text-slate-400">
              Why it converts
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-white">
              Narrative clarity up front, analytical depth on entry.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              The landing page previews the dashboard experience instead of
              describing it abstractly. Motion, surface depth, and data-led
              storytelling push users directly toward the product.
            </p>
          </SectionReveal>
          <SectionReveal className="grid-glow surface col-span-12 rounded-[30px] border border-white/10 p-6 lg:col-span-3">
            <p className="text-xs uppercase tracking-[0.34em] text-slate-400">
              Performance
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-white">
              100K+ row virtualization
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Dense departmental data remains responsive with sticky headers,
              deferred search, and keyboard-first navigation.
            </p>
          </SectionReveal>
          <SectionReveal className="grid-glow surface col-span-12 rounded-[30px] border border-white/10 p-6 lg:col-span-4">
            <p className="text-xs uppercase tracking-[0.34em] text-slate-400">
              Multi-tenancy
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-white">
              Tenant switching without route churn
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Department-specific colors, metrics, and AI context shift
              instantly while preserving the operating workflow.
            </p>
          </SectionReveal>
          <SectionReveal className="grid-glow surface col-span-12 rounded-[30px] border border-white/10 p-6 lg:col-span-4">
            <p className="text-xs uppercase tracking-[0.34em] text-slate-400">
              AI Layer
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-white">
              Streaming insight narration
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Gemini reads the active filter state and streams an executive
              summary, complete with a visible reasoning phase.
            </p>
          </SectionReveal>
          <SectionReveal className="grid-glow surface col-span-12 rounded-[30px] border border-white/10 p-6 lg:col-span-4">
            <p className="text-xs uppercase tracking-[0.34em] text-slate-400">
              UX Detail
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-white">
              Command palette, shimmer loading, and polished micro-states
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              The product behaves like a serious analytics tool, not a static
              demo.
            </p>
          </SectionReveal>
          <SectionReveal className="grid-glow surface col-span-12 rounded-[30px] border border-white/10 p-6 lg:col-span-4">
            <p className="text-xs uppercase tracking-[0.34em] text-slate-400">
              Assignment stack
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-white">
              Next.js, Tailwind, Motion, Zustand, TanStack Query, Gemini
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              The architecture is set up for productizing the concept instead of
              stopping at UI decoration.
            </p>
          </SectionReveal>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          {tenantCards.map((tenant) => (
            <SectionReveal
              key={tenant.id}
              className="surface rounded-[30px] border border-white/10 p-6"
            >
              <div
                className="inline-flex rounded-full px-3 py-1 text-xs uppercase tracking-[0.28em]"
                style={{
                  backgroundColor: tenant.softColor,
                  color: tenant.color,
                }}
              >
                {tenant.shortName}
              </div>
              <h3 className="mt-4 text-3xl font-semibold text-white">
                {tenant.name}
              </h3>
              <p className="mt-3 text-base leading-7 text-slate-300">
                {tenant.description}
              </p>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {tenant.metrics.slice(0, 4).map((metric) => (
                  <div
                    key={metric}
                    className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-200"
                  >
                    {metric}
                  </div>
                ))}
              </div>
              <p className="mt-5 text-sm text-slate-400">
                Public-source reference: {tenant.sourceLabel}
              </p>
            </SectionReveal>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_420px]">
          <SectionReveal className="surface rounded-[30px] border border-white/10 p-6">
            <p className="text-xs uppercase tracking-[0.34em] text-slate-400">
              Live Integration Readiness
            </p>
            <h3 className="mt-4 text-3xl font-semibold text-white">
              data.gov.in and Supabase are now part of the runtime path.
            </h3>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
              The dashboard now fetches department data through a server route
              that can call real `data.gov.in` APIs, and the auth layer supports
              real session-backed sign-in via Supabase magic links.
            </p>
          </SectionReveal>
          <SectionReveal>
            <AuthPanel />
          </SectionReveal>
        </section>
      </div>
    </main>
  );
}
