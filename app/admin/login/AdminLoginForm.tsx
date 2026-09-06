"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientSupabaseClient } from "@/lib/supabase/client";
import { maskEmail } from "@/lib/email";

const RESET_COOLDOWN_SECONDS = 20;
const LOGIN_COOLDOWN_SECONDS = 10;

export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/admin";
  const reason = searchParams.get("reason");
  const supabase = useMemo(() => createClientSupabaseClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(
    reason === "unauthorized" ? "You do not have permission to access the admin console." : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  function startCooldown(seconds: number) {
    setCooldown(seconds);
    const timer = setInterval(() => {
      setCooldown((value) => {
        if (value <= 1) {
          clearInterval(timer);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
  }

  async function onLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus(null);
    setLoginLoading(true);

    try {
      if (!supabase) {
        setError("Authentication is not configured. Contact an administrator.");
        return;
      }
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        startCooldown(LOGIN_COOLDOWN_SECONDS);
        setError("Sign-in failed. Check your credentials and try again.");
        return;
      }

      router.push(nextPath);
      router.refresh();
    } finally {
      setLoginLoading(false);
    }
  }

  async function onRequestReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus(null);
    setResetLoading(true);

    try {
      if (!supabase) {
        setError("Authentication is not configured. Contact an administrator.");
        return;
      }
      const origin = window.location.origin;
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/admin/reset-password`,
      });

      setStatus(
        `If an account exists, a reset link was sent to ${maskEmail(email)}. Please check your inbox.`,
      );
      startCooldown(RESET_COOLDOWN_SECONDS);
    } finally {
      setResetLoading(false);
    }
  }

  const disabled = cooldown > 0 || loginLoading || resetLoading;

  return (
    <div className="min-h-screen bg-[#070b14] text-[#f4f1ea] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
        <h1 className="text-2xl font-semibold">Admin sign in</h1>
        <p className="mt-2 text-sm text-white/60">
          Sign in with your Supabase Auth administrator account.
        </p>

        <form className="mt-6 space-y-4" onSubmit={onLogin}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-white/15 bg-[#0f1423] px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-white/15 bg-[#0f1423] px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={disabled}
            className="btn-gold w-full rounded-lg px-4 py-2 text-sm disabled:opacity-60"
          >
            {loginLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <form className="mt-4" onSubmit={onRequestReset}>
          <button
            type="submit"
            disabled={disabled || !email}
            className="w-full rounded-lg border border-[#c9a227]/40 px-4 py-2 text-sm text-[#e8d48b] disabled:opacity-60"
          >
            {resetLoading ? "Requesting..." : "Request password reset"}
          </button>
        </form>

        {cooldown > 0 && (
          <p className="mt-3 text-xs text-white/50" role="status">
            Please wait {cooldown}s before trying again.
          </p>
        )}

        {status && (
          <p className="mt-4 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
            {status}
          </p>
        )}

        {error && (
          <p
            className="mt-4 rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
