"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

type Plan = {
  id: string;
  name: string;
  priceUsd: number;
  dailyProfitUsd: number;
};

export function PlansClient({
  locale,
  plans,
}: {
  locale: Locale;
  plans: Plan[];
}) {
  const router = useRouter();
  const [msg, setMsg] = useState("");

  async function buy(planId: string) {
    setMsg("");
    const res = await fetch("/api/plans/buy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
    if (!res.ok) {
      setMsg(t(locale, "insufficientBalance"));
      return;
    }
    router.refresh();
    setMsg("OK");
  }

  return (
    <div className="space-y-4">
      {msg && (
        <p className="text-sm text-amber-700">{msg}</p>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-lg font-bold text-slate-800">{plan.name}</h2>
            <p className="mt-2 text-3xl font-bold text-emerald-700">
              ${plan.priceUsd}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {t(locale, "dailyProfitLabel")}: ${plan.dailyProfitUsd}
            </p>
            <button
              type="button"
              onClick={() => buy(plan.id)}
              className="mt-4 w-full rounded-xl bg-emerald-600 py-2 font-medium text-white"
            >
              {t(locale, "buyPlan")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
