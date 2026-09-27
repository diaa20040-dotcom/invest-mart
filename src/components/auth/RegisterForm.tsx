"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

export function RegisterForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        name,
        referralCode: referralCode || undefined,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(
        typeof data.error === "string" ? data.error : t(locale, "registerFailed")
      );
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <p className="text-sm font-medium tracking-wide text-indigo-300">
          {t(locale, "appName")}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {t(locale, "authRegisterTitle")}
        </h1>
        <p className="mt-2 text-sm text-slate-400">{t(locale, "authRegisterSubtitle")}</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/95 p-6 text-slate-900 shadow-2xl shadow-indigo-950/40 backdrop-blur sm:p-8">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              {t(locale, "name")}
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-indigo-500 focus:ring-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              {t(locale, "email")}
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-indigo-500 focus:ring-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              {t(locale, "password")}
            </label>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-indigo-500 focus:ring-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              {t(locale, "referralCodeOptional")}
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-indigo-500 focus:ring-2"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
            />
          </div>
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "…" : t(locale, "register")}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          {t(locale, "alreadyHaveAccount")}{" "}
          <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-800">
            {t(locale, "login")}
          </Link>
        </p>
      </div>
    </div>
  );
}
