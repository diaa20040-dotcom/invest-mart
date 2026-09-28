"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import type { DepositNetwork } from "@/lib/deposit-networks";

export function DepositForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [network, setNetwork] = useState<DepositNetwork>("trc20");
  const [amount, setAmount] = useState("10");
  const [senderAddress, setSenderAddress] = useState("");
  const [status, setStatus] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("");
    const res = await fetch("/api/deposits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: parseFloat(amount),
        network,
        senderAddress: senderAddress.trim(),
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setStatus(data.error === "invalid_sender" ? "invalid_sender" : "error");
      return;
    }
    setStatus("submitted");
    setSenderAddress("");
    setTimeout(() => router.refresh(), 2000);
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-5">
      <p className="text-sm font-medium text-slate-700">
        {t(locale, "depositRequestTitle")}
      </p>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">{t(locale, "depositNetwork")}</legend>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="network"
              checked={network === "trc20"}
              onChange={() => setNetwork("trc20")}
            />
            {t(locale, "networkTrc20")}
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="network"
              checked={network === "bep20"}
              onChange={() => setNetwork("bep20")}
            />
            {t(locale, "networkBep20")}
          </label>
        </div>
      </fieldset>

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

      <label className="block text-sm font-medium">{t(locale, "senderWallet")}</label>
      <input
        type="text"
        required
        autoComplete="off"
        placeholder={
          network === "bep20"
            ? "0x..."
            : "T..."
        }
        className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
        value={senderAddress}
        onChange={(e) => setSenderAddress(e.target.value)}
      />
      <p className="text-xs text-slate-500">{t(locale, "senderWalletHint")}</p>

      <button
        type="submit"
        className="w-full rounded-xl bg-indigo-600 py-2.5 font-medium text-white shadow-sm"
      >
        {t(locale, "submitDeposit")}
      </button>
      {status === "submitted" && (
        <p className="text-sm text-indigo-600">{t(locale, "depositPending")}</p>
      )}
      {status === "invalid_sender" && (
        <p className="text-sm text-red-600">{t(locale, "invalidSenderWallet")}</p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-600">{t(locale, "depositError")}</p>
      )}
    </form>
  );
}
