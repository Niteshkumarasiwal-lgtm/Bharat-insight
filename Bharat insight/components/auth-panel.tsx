"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { hasSupabaseEnv } from "@/lib/supabase";

export default function AuthPanel({
  initialUserEmail,
}: {
  initialUserEmail?: string | null;
}) {
  const [email, setEmail] = useState(initialUserEmail ?? "");
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState(
    hasSupabaseEnv()
      ? "Authenticate with a Supabase magic link."
      : "Add Supabase environment variables to enable real auth."
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    if (!supabase) {
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    const supabase = createBrowserSupabaseClient();

    if (!supabase || !email.trim()) {
      return;
    }

    setIsSubmitting(true);
    const redirectTo = `${window.location.origin}/auth/callback?next=/dashboard`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    setMessage(
      error
        ? error.message
        : "Magic link sent. Check your inbox to complete sign-in."
    );
    setIsSubmitting(false);
  };

  const signOut = async () => {
    const supabase = createBrowserSupabaseClient();

    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    setMessage("Signed out.");
  };

  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
        Supabase Authentication
      </p>
      <p className="mt-3 text-sm leading-6 text-slate-300">
        {user?.email
          ? `Signed in as ${user.email}.`
          : hasSupabaseEnv()
            ? "Use a magic link to create a real session-backed login."
            : "The app is currently in demo auth mode until Supabase keys are configured."}
      </p>

      {hasSupabaseEnv() ? (
        <>
          {!user ? (
            <div className="mt-4">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="your.email@example.com"
                className="h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={signIn}
                disabled={isSubmitting || !email.trim()}
                className="mt-3 w-full rounded-[18px] bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Sending magic link..." : "Send magic link"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={signOut}
              className="mt-4 w-full rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Sign out
            </button>
          )}
        </>
      ) : null}

      <p className="mt-3 text-sm text-slate-400">{message}</p>
    </div>
  );
}
