"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { formatCountdown } from "@/lib/daily-profit";
import { MIN_WITHDRAWAL_USD } from "@/lib/platform-rules";

export function ProfileActions({
  locale,
  payoutWallet,
  canClaim,
  claimableAmount,
  nextClaimAtIso,
  hasActivePlan,
}: {
  locale: Locale;
  payoutWallet: string;
  canClaim: boolean;
  claimableAmount: number;
  nextClaimAtIso: string | null;
  hasActivePlan: boolean;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState("");
  const [msg, setMsg] = useState("");
  const [nextClaimAt, setNextClaimAt] = useState<number | null>(
    nextClaimAtIso ? new Date(nextClaimAtIso).getTime() : null
  );
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    setNextClaimAt(nextClaimAtIso ? new Date(nextClaimAtIso).getTime() : null);
  }, [nextClaimAtIso]);

  useEffect(() => {
    if (!nextClaimAt || canClaim) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [nextClaimAt, canClaim]);

  useEffect(() => {
    if (
      hasActivePlan &&
      !canClaim &&
      nextClaimAt &&
      nextClaimAt - now <= 0
    ) {
      router.refresh();
    }
  }, [now, canClaim, hasActivePlan, nextClaimAt, router]);

  const remainingMs =
    nextClaimAt && !canClaim ? Math.max(0, nextClaimAt - now) : 0;
  const onCooldown = hasActivePlan && !canClaim && remainingMs > 0;

  async function claimProfit() {
    if (!canClaim) return;
    setMsg("");
    const res = await fetch("/api/profit/claim", { method: "POST" });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      if (err.error === "cooldown_active" || err.error === "already_claimed_or_no_plan") {
        if (err.nextClaimAt) {
          setNextClaimAt(new Date(err.nextClaimAt).getTime());
        }
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
      const err = await res.json().catch(() => ({}));
      if (err.error === "min_withdrawal") {
        setMsg(t(locale, "withdrawMinHint"));
      } else {
        setMsg(t(locale, "insufficientBalance"));
      }
      return;
    }
    setAmount("");
    setWallet("");
    router.refresh();
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="card p-5">
        <h2 className="font-bold">{t(locale, "dailyProfit")}</h2>
        <p className="mt-1 text-xs text-slate-500">{t(locale, "claimCooldownHint")}</p>

        {hasActivePlan && (
          <p className="mt-2 text-sm text-slate-600">
            {canClaim
              ? t(locale, "claimReady")
              : onCooldown
                ? `${t(locale, "claimTimerLabel")}:`
                : t(locale, "noActivePlan")}
          </p>
        )}

        {onCooldown && (
          <div
            className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/80 px-4 py-3 text-center"
            dir="ltr"
          >
            <p className="text-3xl font-semibold tabular-nums tracking-wide text-indigo-700">
              {formatCountdown(remainingMs, locale)}
            </p>
          </div>
        )}

        {canClaim && claimableAmount > 0 && (
          <p className="mt-2 text-sm font-medium text-indigo-600">
            +${claimableAmount.toFixed(2)}
          </p>
        )}

        <button
          type="button"
          onClick={claimProfit}
          disabled={!canClaim}
          className="mt-3 w-full rounded-xl bg-indigo-600 py-2.5 text-white shadow-sm transition enabled:hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {t(locale, "dailyProfit")}
        </button>
      </div>
      <div className="card p-5">
        <h2 className="font-bold">{t(locale, "withdrawTitle")}</h2>
        <p className="mt-1 text-xs text-slate-500">{t(locale, "withdrawWalletHint")}</p>
        <p className="mt-1 text-xs font-medium text-slate-600">{t(locale, "withdrawMinHint")}</p>
        <p className="mt-2 break-all rounded bg-slate-100 p-2 font-mono text-xs">
          {payoutWallet}
        </p>
        <form onSubmit={withdraw} className="mt-3 space-y-2">
          <input
            type="number"
            min={MIN_WITHDRAWAL_USD}
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
      {msg && <p className="text-sm text-indigo-600 md:col-span-2">{msg}</p>}
    </div>
  );
}
