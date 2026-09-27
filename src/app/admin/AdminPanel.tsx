"use client";

import { useEffect, useState } from "react";

type Plan = {
  id: string;
  nameEn: string;
  nameAr: string;
  priceUsd: number;
  dailyProfitUsd: number;
  active: boolean;
};

export function AdminPanel() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [depositWallet, setDepositWallet] = useState("");
  const [withdrawWallet, setWithdrawWallet] = useState("");
  const [referralPercent, setReferralPercent] = useState(10);
  const [newPlan, setNewPlan] = useState({
    nameEn: "",
    nameAr: "",
    priceUsd: "9",
    dailyProfitUsd: "3",
  });

  async function load() {
    const [pRes, sRes] = await Promise.all([
      fetch("/api/admin/plans"),
      fetch("/api/admin/settings"),
    ]);
    if (pRes.ok) setPlans(await pRes.json());
    if (sRes.ok) {
      const s = await sRes.json();
      setDepositWallet(s.depositWallet);
      setWithdrawWallet(s.withdrawWallet);
      setReferralPercent(s.referralPercent);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function saveSettings() {
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        depositWallet,
        withdrawWallet,
        referralPercent,
      }),
    });
    alert("Saved");
  }

  async function addPlan() {
    await fetch("/api/admin/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nameEn: newPlan.nameEn,
        nameAr: newPlan.nameAr,
        priceUsd: parseFloat(newPlan.priceUsd),
        dailyProfitUsd: parseFloat(newPlan.dailyProfitUsd),
        active: true,
      }),
    });
    setNewPlan({ nameEn: "", nameAr: "", priceUsd: "9", dailyProfitUsd: "3" });
    load();
  }

  return (
    <div className="space-y-8 pb-8">
      <h1 className="text-2xl font-bold">Admin</h1>

      <section className="card space-y-3 p-5">
        <h2 className="font-bold">Wallets & referral %</h2>
        <label className="block text-sm">Deposit wallet</label>
        <input
          className="w-full rounded border px-3 py-2 font-mono text-sm"
          value={depositWallet}
          onChange={(e) => setDepositWallet(e.target.value)}
        />
        <label className="block text-sm">Withdraw (payout) wallet</label>
        <input
          className="w-full rounded border px-3 py-2 font-mono text-sm"
          value={withdrawWallet}
          onChange={(e) => setWithdrawWallet(e.target.value)}
        />
        <label className="block text-sm">Referral %</label>
        <input
          type="number"
          className="w-32 rounded border px-3 py-2"
          value={referralPercent}
          onChange={(e) => setReferralPercent(parseFloat(e.target.value))}
        />
        <button
          type="button"
          onClick={saveSettings}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white"
        >
          Save
        </button>
      </section>

      <section className="card space-y-3 p-5">
        <h2 className="font-bold">Plans</h2>
        <ul className="space-y-2 text-sm">
          {plans.map((p) => (
            <li key={p.id} className="flex justify-between border-b py-2">
              <span>
                {p.nameEn} / {p.nameAr} — ${p.priceUsd} → ${p.dailyProfitUsd}/day
              </span>
              <button
                type="button"
                className="text-red-600"
                onClick={async () => {
                  await fetch(`/api/admin/plans/${p.id}`, { method: "DELETE" });
                  load();
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            placeholder="Name EN"
            className="rounded border px-2 py-1"
            value={newPlan.nameEn}
            onChange={(e) => setNewPlan({ ...newPlan, nameEn: e.target.value })}
          />
          <input
            placeholder="Name AR"
            className="rounded border px-2 py-1"
            value={newPlan.nameAr}
            onChange={(e) => setNewPlan({ ...newPlan, nameAr: e.target.value })}
          />
          <input
            placeholder="Price"
            className="rounded border px-2 py-1"
            value={newPlan.priceUsd}
            onChange={(e) => setNewPlan({ ...newPlan, priceUsd: e.target.value })}
          />
          <input
            placeholder="Daily profit"
            className="rounded border px-2 py-1"
            value={newPlan.dailyProfitUsd}
            onChange={(e) =>
              setNewPlan({ ...newPlan, dailyProfitUsd: e.target.value })
            }
          />
        </div>
        <button
          type="button"
          onClick={addPlan}
          className="rounded-lg bg-slate-800 px-4 py-2 text-white"
        >
          Add plan
        </button>
      </section>

      <p className="text-sm text-slate-500">
        Demo admin: admin@invest.local / admin123 — deposits auto-approve for users.
      </p>
    </div>
  );
}
