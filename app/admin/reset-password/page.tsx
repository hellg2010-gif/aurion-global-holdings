"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClientSupabaseClient } from "@/lib/supabase/client";
import { maskEmail } from "@/lib/email";

export default function AdminResetPasswordPage() {
  const supabase = useMemo(() => createClientSupabaseClient(), []);
  const [ready, setReady] = useState(false);
  const [isRecoveryVerified, setIsRecoveryVerified] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function initialize() {
      if (!supabase) {
        setReady(true);
        return;
      }
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      const type = hash.get("type");

      if (type === "recovery" && accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (!sessionError) {
          setIsRecoveryVerified(true);
        }
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        setMaskedEmail(maskEmail(user.email));
      }

      setReady(true);
    }

    void initialize();
  }, [supabase]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setStatus(null);

    try {
      if (!supabase) {
        setError("Authentication is not configured. Contact an administrator.");
        return;
      }
      if (newPassword.length < 12) {
        setError("Password must be at least 12 characters.");
        return;
      }

      if (newPassword !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Recovery session is required. Request a new reset email.");
        return;
      }

      if (!isRecoveryVerified) {
        if (!user.email || !currentPassword) {
          setError("Please verify with your current password.");
          return;
        }

        const { error: authError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword,
        });

        if (authError) {
          setError("Verification failed. Please retry.");
          return;
        }
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError("Could not update password. Request a new reset link and try again.");
        return;
      }

      setStatus("Password updated successfully. You can now sign in.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setSubmitting(false);
    }
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070b14] text-[#f4f1ea]">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-[#f4f1ea] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
        <h1 className="text-2xl font-semibold">Reset admin password</h1>
        <p className="mt-2 text-sm text-white/60">
          Continue only from a verified recovery link, or confirm with current password.
        </p>

        {maskedEmail && (
          <p className="mt-3 text-sm text-white/70">Destination: {maskedEmail}</p>
        )}

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          {!isRecoveryVerified && (
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium mb-1">
                Current password
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#0f1423] px-3 py-2 text-sm"
              />
            </div>
          )}

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium mb-1">
              New password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              minLength={12}
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="w-full rounded-lg border border-white/15 bg-[#0f1423] px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={12}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-lg border border-white/15 bg-[#0f1423] px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-gold w-full rounded-lg px-4 py-2 text-sm disabled:opacity-60"
          >
            {submitting ? "Updating..." : "Update password"}
          </button>
        </form>

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

        <Link href="/admin/login" className="mt-5 inline-block text-sm text-[#e8d48b] hover:underline">
          Back to admin login
        </Link>
      </div>
    </div>
  );
}
