"use client";

import { useState } from "react";

export function SetupBootstrapForm() {
  const [secret, setSecret] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function runBootstrap(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/setup/bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStatus("تمت التهيئة بنجاح. جرّب تسجيل الدخول الآن.");
        setSecret("");
      } else if (data.error === "forbidden") {
        setStatus("السر غير صحيح — يجب أن يطابق SETUP_SECRET على Vercel.");
      } else if (data.error === "missing_turso_env") {
        setStatus("متغيرات Turso ناقصة على Vercel.");
      } else {
        setStatus(data.error ?? "فشلت التهيئة. راجع سجلات Vercel.");
      }
    } catch {
      setStatus("تعذر الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={runBootstrap} className="mt-8 space-y-3 rounded-xl border border-slate-600/50 p-4">
      <p className="text-sm font-medium text-slate-100">تهيئة الجداول والأدمن (مرة واحدة)</p>
      <p className="text-xs text-slate-400">
        بعد أن يصبح /api/health/db يظهر schema_not_applied أو بعد نجاح الاتصال، أدخل
        SETUP_SECRET من Vercel:
      </p>
      <input
        type="password"
        value={secret}
        onChange={(e) => setSecret(e.target.value)}
        placeholder="SETUP_SECRET"
        className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
        autoComplete="off"
      />
      <button
        type="submit"
        disabled={loading || !secret}
        className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium disabled:opacity-50"
      >
        {loading ? "جاري التهيئة…" : "تشغيل التهيئة"}
      </button>
      {status ? <p className="text-sm text-slate-200">{status}</p> : null}
    </form>
  );
}
