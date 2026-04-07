"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DEPARTMENT_CONFIG } from "@/lib/departments";
import { hasSupabaseEnv } from "@/lib/supabase";
import { useUIStore } from "@/store/ui-store";
import type { DepartmentId } from "@/lib/types";

type CommandAction = {
  id: string;
  label: string;
  hint: string;
  keywords: string;
  action: () => void;
};

export default function CommandPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const {
    paletteOpen,
    closePalette,
    department,
    setDepartment,
    role,
    setRole,
  } = useUIStore();

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        useUIStore.getState().togglePalette();
      }

      if (event.key === "Escape") {
        closePalette();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [closePalette]);

  const actions = useMemo<CommandAction[]>(
    () => [
      {
        id: "go-home",
        label: "Go to Landing Page",
        hint: "Navigate to the marketing experience",
        keywords: "home landing hero",
        action: () => router.push("/"),
      },
      {
        id: "go-dashboard",
        label: "Open Dashboard",
        hint: "Jump into the analytics workspace",
        keywords: "dashboard analytics grid",
        action: () => router.push("/dashboard"),
      },
      {
        id: "department-health",
        label: "Switch to Health",
        hint: DEPARTMENT_CONFIG.health.description,
        keywords: "health ministry hospitals vaccination",
        action: () => setDepartment("health"),
      },
      {
        id: "department-agriculture",
        label: "Switch to Agriculture",
        hint: DEPARTMENT_CONFIG.agriculture.description,
        keywords: "agriculture crop irrigation yield",
        action: () => setDepartment("agriculture"),
      },
      {
        id: "role-admin",
        label: "Set Role: Admin",
        hint: "Enable edit and delete controls",
        keywords: "admin permissions edit delete",
        action: () => setRole("admin"),
      },
      {
        id: "role-viewer",
        label: "Set Role: Viewer",
        hint: "Show read-only access state",
        keywords: "viewer read only",
        action: () => setRole("viewer"),
      },
      {
        id: "focus-search",
        label: "Focus Grid Search",
        hint: "Places the cursor in the dashboard search box",
        keywords: "search grid filter query",
        action: () => {
          if (pathname !== "/dashboard") {
            router.push("/dashboard");
            window.setTimeout(() => {
              document.getElementById("grid-search")?.focus();
            }, 150);
            return;
          }

          document.getElementById("grid-search")?.focus();
        },
      },
    ],
    [pathname, router, setDepartment, setRole]
  );

  const filteredActions = actions.filter((item) => {
    const haystack = `${item.label} ${item.hint} ${item.keywords}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  if (!paletteOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-950/70 px-4 pt-20 backdrop-blur-md">
      <div className="surface-strong w-full max-w-2xl rounded-[28px] border border-white/10 shadow-[0_32px_100px_rgba(0,0,0,0.45)]">
        <div className="border-b border-white/10 px-5 py-4">
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search navigation, tenants, and actions"
            className="w-full bg-transparent text-base text-white outline-none placeholder:text-slate-500"
          />
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
            <span className="rounded-full border border-white/10 px-2 py-1">
              Active tenant: {DEPARTMENT_CONFIG[department as DepartmentId].name}
            </span>
            <span className="rounded-full border border-white/10 px-2 py-1">
              Role: {role}
            </span>
            <span className="rounded-full border border-white/10 px-2 py-1">
              Auth: {hasSupabaseEnv() ? "Supabase ready" : "Demo mode"}
            </span>
          </div>
        </div>
        <div className="max-h-[420px] overflow-y-auto p-3 scrollbar-thin">
          {filteredActions.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setQuery("");
                item.action();
                closePalette();
              }}
              className="flex w-full items-start justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-white/6"
            >
              <span>
                <span className="block text-sm font-semibold text-white">
                  {item.label}
                </span>
                <span className="mt-1 block text-sm text-slate-400">
                  {item.hint}
                </span>
              </span>
              <span className="rounded-full border border-white/10 px-2 py-1 text-[11px] uppercase tracking-[0.24em] text-slate-500">
                Run
              </span>
            </button>
          ))}
          {filteredActions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-sm text-slate-400">
              No commands matched. Try searching for dashboard, health, viewer,
              or admin.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
