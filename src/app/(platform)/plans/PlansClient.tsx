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
            className="card p-5"
          >
            <h2 className="text-lg font-bold text-slate-800">{plan.name}</h2>
            <p className="mt-2 text-3xl font-bold text-indigo-600">
              ${plan.priceUsd}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {t(locale, "dailyProfitLabel")}: ${plan.dailyProfitUsd}
            </p>
            <button
              type="button"
              onClick={() => buy(plan.id)}
              className="mt-4 w-full rounded-xl bg-indigo-600 py-2.5 font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              {t(locale, "buyPlan")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
