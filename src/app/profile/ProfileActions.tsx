"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

export function ProfileActions({
  locale,
  payoutWallet,
}: {
  locale: Locale;
  payoutWallet: string;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState("");
  const [msg, setMsg] = useState("");

  async function claimProfit() {
    setMsg("");
    const res = await fetch("/api/profit/claim", { method: "POST" });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      if (err.error === "already_claimed_or_no_plan") {
        setMsg(t(locale, "alreadyClaimed"));
      } else {
        setMsg(t(locale, "noActivePlan"));
      }
      return;
    }
    setMsg(t(locale, "dailyProfitOk"));
    router.refresh();
  }

  async function withdraw(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const res = await fetch("/api/withdrawals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: parseFloat(amount),
        walletAddress: wallet,
      }),
    });
    if (!res.ok) {
      setMsg("Error");
      return;
    }
    setAmount("");
    setWallet("");
    router.refresh();
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border bg-white p-5">
        <h2 className="font-bold">{t(locale, "dailyProfit")}</h2>
        <button
          type="button"
          onClick={claimProfit}
          className="mt-3 w-full rounded-xl bg-teal-600 py-2 text-white"
        >
          {t(locale, "dailyProfit")}
        </button>
      </div>
      <div className="rounded-2xl border bg-white p-5">
        <h2 className="font-bold">{t(locale, "withdrawTitle")}</h2>
        <p className="mt-1 text-xs text-slate-500">{t(locale, "withdrawWalletHint")}</p>
        <p className="mt-2 break-all rounded bg-slate-100 p-2 font-mono text-xs">
          {payoutWallet}
        </p>
        <form onSubmit={withdraw} className="mt-3 space-y-2">
          <input
            type="number"
            min="1"
            step="0.01"
            required
            placeholder={t(locale, "amount")}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <input
            type="text"
            required
            placeholder={t(locale, "yourWallet")}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-slate-800 py-2 text-sm text-white"
          >
            {t(locale, "requestWithdraw")}
          </button>
        </form>
      </div>
      {msg && <p className="text-sm text-emerald-700 md:col-span-2">{msg}</p>}
    </div>
  );
}
