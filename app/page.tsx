import Link from "next/link";

const projectFacts = [
  {
    label: "Frontend stack",
    value: "Next.js 16 + TypeScript + Tailwind v4",
  },
  {
    label: "AI backend",
    value: "/api/ai proxies Gemini responses",
  },
  {
    label: "Data layer",
    value: "Health and Agriculture dashboards",
  },
  {
    label: "Runtime readiness",
    value: "data.gov.in and Supabase support",
  },
];

const backendNotes = [
  "The dashboard currently hydrates with demo user data and expands it into a larger analytics surface.",
  "AI questions are routed through the server-side `/api/ai` endpoint and sent to Gemini.",
  "The project README shows the intended backend direction: `data.gov.in` feeds, Supabase auth, and a grounded analytics workflow.",
];

const featureCards = [
  {
    title: "Project basis",
    body: "Built as a Bharat Insight analytics workspace for Indian public-sector style data, with a dark dashboard-first experience.",
  },
  {
    title: "Department switching",
    body: "The dashboard supports Health and Agriculture views, so the user can move between data contexts without route reloads.",
  },
  {
    title: "AI-assisted analysis",
    body: "A question box in the dashboard lets the user ask Gemini for insight on the active dataset slice.",
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.25),transparent_30%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_28%),linear-gradient(180deg,#09111f_0%,#050816_45%,#03050b_100%)]" />
      <div className="absolute left-[-8rem] top-24 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
      <div className="absolute right-[-7rem] top-44 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-16 pt-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-4 py-3 backdrop-blur md:px-5">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-slate-400">
              Bharat Insight
            </p>
            <p className="mt-1 text-sm text-slate-300">
              Public data analytics with a Gemini-powered backend
            </p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(56,189,248,0.35)] transition hover:bg-sky-400"
          >
            Open Dashboard
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-xs uppercase tracking-[0.34em] text-sky-200">
              Next.js 16 assignment build
            </div>

            <h1 className="mt-6 text-balance text-5xl font-semibold leading-[1.02] tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
              Bharat Insight turns public-sector data into a fast AI analytics
              workspace.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              This landing page now reflects the actual project basis: a
              dashboard-oriented Bharat Insight app built with Next.js, backed
              by a Gemini API route, and prepared for real data.gov.in and
              Supabase integration.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(56,189,248,0.35)] transition hover:bg-sky-400"
              >
                Go to Dashboard
              </Link>
              <a
                href="#backend-info"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
              >
                View backend details
              </a>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {projectFacts.map((fact) => (
                <div
                  key={fact.label}
                  className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur"
                >
                  <p className="text-xs uppercase tracking-[0.26em] text-slate-400">
                    {fact.label}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-white">
                    {fact.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.98))] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.34em] text-slate-400">
                  Dashboard Preview
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  What this app is built to do
                </h2>
              </div>
              <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                Backend ready
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {featureCards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-[26px] border border-white/10 bg-white/5 p-5"
                >
                  <h3 className="text-lg font-semibold text-white">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {card.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="backend-info"
          className="grid gap-6 pb-6 lg:grid-cols-[0.95fr_1.05fr]"
        >
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.34em] text-slate-400">
              Backend information
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-white">
              The homepage now explains the project&apos;s real backend path.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              There is no command-palette hint on this page. Instead, the focus
              is on the system that powers the app: an AI route, a dashboard
              that consumes data, and the planned live integrations.
            </p>
          </div>

          <div className="grid gap-4">
            {backendNotes.map((note) => (
              <div
                key={note}
                className="rounded-[26px] border border-white/10 bg-white/5 p-5 text-sm leading-7 text-slate-300 backdrop-blur"
              >
                {note}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
