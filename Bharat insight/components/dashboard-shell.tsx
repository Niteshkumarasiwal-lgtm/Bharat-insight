"use client";

import { startTransition, useDeferredValue, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import Link from "next/link";
import AuthPanel from "@/components/auth-panel";
import { DEPARTMENT_CONFIG } from "@/lib/departments";
import { hasSupabaseEnv } from "@/lib/supabase";
import type { DatasetSummary, DepartmentDatasetPage, DepartmentId } from "@/lib/types";
import { useUIStore } from "@/store/ui-store";

const PAGE_SIZE = 100;

type InsightState = {
  question: string;
  answer: string;
  thinking: string;
  status: "idle" | "streaming" | "error";
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(value);
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="surface rounded-[24px] border border-white/10 p-4">
      <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{detail}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_380px]">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-4">
        <div className="mb-4 flex gap-3">
          <div className="skeleton h-11 flex-1 rounded-2xl" />
          <div className="skeleton h-11 w-32 rounded-2xl" />
          <div className="skeleton h-11 w-32 rounded-2xl" />
        </div>
        <div className="skeleton h-[580px] rounded-[24px]" />
      </div>
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-4">
        <div className="skeleton mb-3 h-6 w-36 rounded-full" />
        <div className="skeleton mb-4 h-24 rounded-[24px]" />
        <div className="skeleton mb-3 h-12 rounded-2xl" />
        <div className="skeleton h-72 rounded-[24px]" />
      </div>
    </div>
  );
}

export default function DashboardShell({
  initialUserEmail,
}: {
  initialUserEmail?: string | null;
}) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [insight, setInsight] = useState<InsightState>({
    question: "What matters most in the current filtered view?",
    answer: "",
    thinking: "",
    status: "idle",
  });
  const { department, setDepartment, role, setRole } = useUIStore();
  const tenant = DEPARTMENT_CONFIG[department];
  const deferredSearch = useDeferredValue(search);
  const rowsQuery = useQuery({
    queryKey: [
      "department-rows",
      department,
      page,
      stateFilter,
      yearFilter,
      deferredSearch,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        department,
        page: String(page),
        pageSize: String(PAGE_SIZE),
        state: stateFilter,
        year: yearFilter,
        query: deferredSearch.trim(),
      });
      const response = await fetch(`/api/datasets?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Unable to load dataset");
      }

      return (await response.json()) as DepartmentDatasetPage;
    },
    placeholderData: (previousData) => previousData,
  });

  const rows = rowsQuery.data?.rows ?? [];
  const datasetMode = rowsQuery.data?.mode ?? "fallback";
  const datasetSourceLabel = rowsQuery.data?.sourceLabel ?? tenant.sourceLabel;
  const stateOptions = rowsQuery.data?.stateOptions ?? [];
  const yearOptions = rowsQuery.data?.yearOptions ?? [];
  const totalRows = rowsQuery.data?.totalRows ?? 0;
  const totalPages = rowsQuery.data?.totalPages ?? 1;
  const currentPage = rowsQuery.data?.page ?? page;
  const summary: DatasetSummary = rowsQuery.data?.summary ?? {
    totalValue: 0,
    averageValue: 0,
    bestState: "No data",
    bestStateValue: 0,
  };
  const selectedRow = rows[selectedIndex];

  useEffect(() => {
    setPage(1);
  }, [department, stateFilter, yearFilter, deferredSearch]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [department, stateFilter, yearFilter, deferredSearch, currentPage]);

  useEffect(() => {
    if (selectedIndex > rows.length - 1) {
      setSelectedIndex(Math.max(0, rows.length - 1));
    }
  }, [rows.length, selectedIndex]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 58,
    overscan: 14,
  });

  const streamInsight = async (question: string) => {
    setInsight({
      question,
      answer: "",
      thinking: "",
      status: "streaming",
    });

    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        department,
        filters: {
          query: deferredSearch,
          state: stateFilter,
          year: yearFilter,
          page: currentPage,
        },
        totalRows,
        stats: summary,
        sampleRows: rows.slice(0, 12),
      }),
    });

    if (!response.body) {
      setInsight((current) => ({
        ...current,
        status: "error",
        answer: "Insight stream was unavailable.",
      }));
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";

      for (const eventChunk of events) {
        const lines = eventChunk.split("\n");
        const event = lines.find((line) => line.startsWith("event:"))?.replace(
          "event:",
          ""
        ).trim();
        const payloadLine = lines.find((line) => line.startsWith("data:"));
        const payload = payloadLine
          ? (JSON.parse(payloadLine.replace("data:", "").trim()) as {
              text?: string;
              message?: string;
            })
          : {};

        if (event === "thinking") {
          setInsight((current) => ({
            ...current,
            thinking: payload.text ?? "",
          }));
        }

        if (event === "token") {
          setInsight((current) => ({
            ...current,
            answer: `${current.answer}${payload.text ?? ""}`,
          }));
        }

        if (event === "error") {
          setInsight((current) => ({
            ...current,
            status: "error",
            answer: payload.message ?? "Insight generation failed.",
          }));
        }

        if (event === "done") {
          setInsight((current) => ({
            ...current,
            status: "idle",
          }));
        }
      }
    }

    setInsight((current) => ({
      ...current,
      status: current.status === "error" ? "error" : "idle",
    }));
  };

  const quickQuestions = [
    "What matters most in the current filtered view?",
    "Which state is leading, and what should an admin investigate next?",
    "Summarize the strongest and weakest signals in plain English.",
  ];

  return (
    <main className="min-h-screen bg-[var(--app-bg)] px-4 py-6 text-white md:px-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="surface rounded-[30px] border border-white/10 p-5 md:p-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.34em] text-slate-400">
                  Bharat Insight Workspace
                </div>
                <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
                  {tenant.name}
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">
                  {tenant.description} This view simulates a data.gov.in style
                  public data workload with {formatNumber(totalRows)} matching records,
                  server-side filters, tenant-aware AI summaries, and a
                  {datasetMode === "live" ? " live" : " fallback"} source path.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => useUIStore.getState().openPalette()}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
                >
                  Open Command Palette
                </button>
                <Link
                  href="/"
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
                >
                  Back to Landing
                </Link>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Filtered Rows"
                value={formatNumber(totalRows)}
                detail={`Showing ${formatNumber(rows.length)} rows on page ${formatNumber(currentPage)}.`}
              />
              <MetricCard
                label="Average Metric"
                value={formatNumber(summary.averageValue)}
                detail={`${tenant.heroMetric} aligned across the current slice.`}
              />
              <MetricCard
                label="Leading State"
                value={summary.bestState}
                detail={`Top aggregate score: ${formatNumber(summary.bestStateValue)}`}
              />
              <MetricCard
                label="Access State"
                value={role === "admin" ? "Admin" : "Viewer"}
                detail={
                  hasSupabaseEnv()
                    ? "Supabase environment detected for auth setup."
                    : "Demo role switcher active until Supabase credentials are added."
                }
              />
            </div>
          </div>
        </section>

        {rowsQuery.isPending ? (
          <DashboardSkeleton />
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_380px]">
            <section className="surface rounded-[30px] border border-white/10 p-4 md:p-5">
              <div className="mb-4 flex flex-col gap-3 lg:flex-row">
                <input
                  id="grid-search"
                  value={search}
                  onChange={(event) =>
                    startTransition(() => setSearch(event.target.value))
                  }
                  placeholder="Search by state, district, metric, or program"
                  className="h-11 flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-white/20"
                />
                <select
                  value={stateFilter}
                  onChange={(event) => setStateFilter(event.target.value)}
                  className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none"
                >
                  <option value="all">All states</option>
                  {stateOptions.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                <select
                  value={yearFilter}
                  onChange={(event) => setYearFilter(event.target.value)}
                  className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none"
                >
                  <option value="all">All years</option>
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(DEPARTMENT_CONFIG) as DepartmentId[]).map((id) => {
                    const config = DEPARTMENT_CONFIG[id];

                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setDepartment(id)}
                        className="rounded-full border px-4 py-2 text-sm transition"
                        style={{
                          borderColor:
                            department === id ? config.color : "rgba(255,255,255,0.1)",
                          backgroundColor:
                            department === id ? config.softColor : "rgba(255,255,255,0.03)",
                          color: department === id ? config.color : "#dbe7ff",
                        }}
                      >
                        {config.name}
                      </button>
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(["viewer", "admin"] as const).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setRole(item)}
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        role === item
                          ? "border-white/30 bg-white/12 text-white"
                          : "border-white/10 bg-white/5 text-slate-300"
                      }`}
                    >
                      {item === "admin" ? "Admin" : "Viewer"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-[28px] border border-white/10">
                <div className="grid grid-cols-[1.1fr_1fr_90px_1.2fr_120px_120px_120px_120px] gap-3 border-b border-white/10 bg-white/6 px-4 py-3 text-xs uppercase tracking-[0.28em] text-slate-400">
                  <span>State</span>
                  <span>District</span>
                  <span>Year</span>
                  <span>Metric</span>
                  <span className="text-right">Value</span>
                  <span className="text-right">YoY</span>
                  <span>Status</span>
                  <span>Actions</span>
                </div>
                <div
                  ref={parentRef}
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (!rows.length) {
                      return;
                    }

                    if (event.key === "ArrowDown") {
                      event.preventDefault();
                      const nextIndex = Math.min(selectedIndex + 1, rows.length - 1);
                      setSelectedIndex(nextIndex);
                      virtualizer.scrollToIndex(nextIndex, { align: "auto" });
                    }

                    if (event.key === "ArrowUp") {
                      event.preventDefault();
                      const nextIndex = Math.max(selectedIndex - 1, 0);
                      setSelectedIndex(nextIndex);
                      virtualizer.scrollToIndex(nextIndex, { align: "auto" });
                    }
                  }}
                  className="scrollbar-thin h-[620px] overflow-auto outline-none"
                >
                  <div
                    style={{ height: `${virtualizer.getTotalSize()}px` }}
                    className="relative"
                  >
                    {virtualizer.getVirtualItems().map((virtualRow) => {
                      const row = rows[virtualRow.index];
                      const isSelected = virtualRow.index === selectedIndex;

                      return (
                        <div
                          key={row.id}
                          className={`absolute left-0 top-0 grid w-full grid-cols-[1.1fr_1fr_90px_1.2fr_120px_120px_120px_120px] gap-3 border-b border-white/6 px-4 py-3 text-sm transition ${
                            isSelected ? "bg-white/10" : "bg-transparent"
                          }`}
                          style={{
                            transform: `translateY(${virtualRow.start}px)`,
                          }}
                        >
                          <div>
                            <p className="font-medium text-white">{row.state}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              {row.program}
                            </p>
                          </div>
                          <span className="text-slate-300">{row.district}</span>
                          <span className="text-slate-300">{row.year}</span>
                          <span className="text-slate-300">{row.metric}</span>
                          <span className="text-right font-medium text-white">
                            {formatNumber(row.value)}
                          </span>
                          <span
                            className={`text-right font-medium ${
                              row.change >= 0 ? "text-emerald-300" : "text-rose-300"
                            }`}
                          >
                            {row.change >= 0 ? "+" : ""}
                            {row.change}%
                          </span>
                          <span>
                            <span
                              className="rounded-full px-3 py-1 text-xs"
                              style={{
                                backgroundColor:
                                  row.status === "On track"
                                    ? "rgba(16,185,129,0.14)"
                                    : row.status === "Watch"
                                      ? "rgba(245,158,11,0.14)"
                                      : "rgba(248,113,113,0.14)",
                                color:
                                  row.status === "On track"
                                    ? "#9ae6b4"
                                    : row.status === "Watch"
                                      ? "#fcd34d"
                                      : "#fca5a5",
                              }}
                            >
                              {row.status}
                            </span>
                          </span>
                          <span className="flex gap-2">
                            {role === "admin" ? (
                              <>
                                <button
                                  type="button"
                                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200 transition hover:bg-white/10"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="rounded-full border border-rose-400/20 px-3 py-1 text-xs text-rose-200 transition hover:bg-rose-400/10"
                                >
                                  Delete
                                </button>
                              </>
                            ) : (
                              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-500">
                                Read only
                              </span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 rounded-[24px] border border-white/10 bg-white/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-300">
                  Page {formatNumber(currentPage)} of {formatNumber(totalPages)}. Showing{" "}
                  {formatNumber(rows.length)} of {formatNumber(totalRows)} matching
                  records.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={currentPage <= 1}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setPage((current) => Math.min(totalPages, current + 1))
                    }
                    disabled={currentPage >= totalPages}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </section>

            <aside className="surface rounded-[30px] border border-white/10 p-4 md:p-5">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                  Tenant Context
                </p>
                <p className="mt-3 text-2xl font-semibold text-white">
                  {tenant.heroMetric}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Source reference: {datasetSourceLabel}
                </p>
              </div>

              <div className="mt-4 rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                  Data Source Mode
                </p>
                <p className="mt-3 text-2xl font-semibold text-white">
                  {datasetMode === "live" ? "Live OGD" : "Fallback"}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Configure `DATA_GOV_IN_API_KEY` to use real `data.gov.in`
                  responses on the server route.
                </p>
              </div>

              <div className="mt-4 rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                  Keyboard Navigation
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Use the grid with arrow keys after focusing the table body.
                  Cmd/Ctrl + K opens global commands.
                </p>
                {selectedRow ? (
                  <div className="mt-4 rounded-[20px] border border-white/10 bg-black/20 p-3 text-sm text-slate-200">
                    <p className="font-medium text-white">{selectedRow.metric}</p>
                    <p className="mt-1 text-slate-400">
                      {selectedRow.state}, {selectedRow.district} · {selectedRow.year}
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="mt-4 rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                  Gemini Insight Panel
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  AI summaries use the active department and full filter scope.
                </p>

                <textarea
                  value={insight.question}
                  onChange={(event) =>
                    setInsight((current) => ({
                      ...current,
                      question: event.target.value,
                    }))
                  }
                  rows={4}
                  className="mt-4 w-full rounded-[22px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                />

                <div className="mt-3 flex flex-wrap gap-2">
                  {quickQuestions.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() =>
                        setInsight((current) => ({
                          ...current,
                          question,
                        }))
                      }
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/10"
                    >
                      {question}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => streamInsight(insight.question)}
                  disabled={!totalRows || insight.status === "streaming"}
                  className="mt-4 w-full rounded-[18px] px-4 py-3 text-sm font-semibold text-slate-950 transition disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(176,224,255,0.92))",
                  }}
                >
                  {insight.status === "streaming"
                    ? "Streaming insight..."
                    : "Generate Insight"}
                </button>

                <div className="mt-4 rounded-[22px] border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                    Thinking State
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    {insight.thinking ||
                      "The reasoning trace appears here before the final answer streams in."}
                  </p>
                </div>

                <div className="mt-4 rounded-[22px] border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                    Final Answer
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-100">
                    {insight.answer ||
                      "Ask for a summary, outlier scan, or executive recommendation to start the AI loop."}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <AuthPanel initialUserEmail={initialUserEmail} />
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
