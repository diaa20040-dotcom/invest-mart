"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

export function DepositForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [amount, setAmount] = useState("10");
  const [status, setStatus] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("");
    const res = await fetch("/api/deposits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: parseFloat(amount) }),
    });
    if (!res.ok) {
      setStatus("Error");
      return;
    }
    setStatus("submitted");
    setTimeout(() => router.refresh(), 3000);
  }

  return (
    <form onSubmit={submit} className="card space-y-3 p-5">
      <label className="block text-sm font-medium">{t(locale, "amount")}</label>
      <input
        type="number"
        min="1"
        step="0.01"
        required
        className="w-full rounded-lg border border-slate-300 px-3 py-2"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button
        type="submit"
        className="w-full rounded-xl bg-indigo-600 py-2.5 font-medium text-white shadow-sm"
      >
        {t(locale, "submitDeposit")}
      </button>
      {status === "submitted" && (
        <p className="text-sm text-indigo-600">{t(locale, "depositPending")}</p>
      )}
    </form>
  );
}
