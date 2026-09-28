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

type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  balance: number;
  referralCode: string;
  isAdmin: boolean;
  createdAt: string;
  referredByEmail: string | null;
  referralsCount: number;
};

type PendingDeposit = {
  id: string;
  amount: number;
  note: string | null;
  createdAt: string;
  userEmail: string;
  userName: string | null;
  network: string;
  senderAddress: string;
};

type PendingWithdrawal = {
  id: string;
  amount: number;
  network: string;
  walletAddress: string;
  createdAt: string;
  userEmail: string;
  userName: string | null;
};

const emptyPlanForm = {
  nameEn: "",
  nameAr: "",
  priceUsd: "9",
  dailyProfitUsd: "3",
  active: true,
};

export function AdminPanel() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [deposits, setDeposits] = useState<PendingDeposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<PendingWithdrawal[]>([]);
  const [depositWalletBep20, setDepositWalletBep20] = useState("");
  const [depositWalletTrc20, setDepositWalletTrc20] = useState("");
  const [withdrawWallet, setWithdrawWallet] = useState("");
  const [referralPercent, setReferralPercent] = useState(25);
  const [newPlan, setNewPlan] = useState(emptyPlanForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPlan, setEditPlan] = useState(emptyPlanForm);
  const [resetUserId, setResetUserId] = useState("");
  const [resetPassword, setResetPassword] = useState("");

  async function load() {
    const [pRes, sRes, uRes, dRes, wRes] = await Promise.all([
      fetch("/api/admin/plans"),
      fetch("/api/admin/settings"),
      fetch("/api/admin/users"),
      fetch("/api/admin/deposits"),
      fetch("/api/admin/withdrawals"),
    ]);
    if (pRes.ok) setPlans(await pRes.json());
    if (uRes.ok) setUsers(await uRes.json());
    if (dRes.ok) setDeposits(await dRes.json());
    if (wRes.ok) setWithdrawals(await wRes.json());
    if (sRes.ok) {
      const s = await sRes.json();
      setDepositWalletBep20(s.depositWalletBep20 ?? s.depositWallet ?? "");
      setDepositWalletTrc20(s.depositWalletTrc20 ?? s.depositWallet ?? "");
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
        depositWalletBep20,
        depositWalletTrc20,
        withdrawWallet,
        referralPercent,
      }),
    });
    alert("Saved");
  }

  async function addPlan() {
    const res = await fetch("/api/admin/plans", {
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
    if (!res.ok) {
      alert("Could not add plan — check values");
      return;
    }
    setNewPlan({ ...emptyPlanForm });
    load();
  }

  function startEdit(p: Plan) {
    setEditingId(p.id);
    setEditPlan({
      nameEn: p.nameEn,
      nameAr: p.nameAr,
      priceUsd: String(p.priceUsd),
      dailyProfitUsd: String(p.dailyProfitUsd),
      active: p.active,
    });
  }

  async function saveEdit() {
    if (!editingId) return;
    const res = await fetch(`/api/admin/plans/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nameEn: editPlan.nameEn,
        nameAr: editPlan.nameAr,
        priceUsd: parseFloat(editPlan.priceUsd),
        dailyProfitUsd: parseFloat(editPlan.dailyProfitUsd),
        active: editPlan.active,
      }),
    });
    if (!res.ok) {
      alert("Could not save plan");
      return;
    }
    setEditingId(null);
    load();
  }

  async function deletePlan(id: string) {
    if (!confirm("Delete this plan?")) return;
    const res = await fetch(`/api/admin/plans/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert("Delete failed");
      return;
    }
    if (data.deactivated) {
      alert(
        "Plan has subscribers — it was hidden (inactive) instead of deleted."
      );
    }
    load();
  }

  async function approveDeposit(id: string) {
    const res = await fetch(`/api/admin/deposits/${id}/approve`, {
      method: "POST",
    });
    if (!res.ok) alert("Approve failed");
    load();
  }

  async function rejectDeposit(id: string) {
    const res = await fetch(`/api/admin/deposits/${id}/reject`, {
      method: "POST",
    });
    if (!res.ok) alert("Reject failed");
    load();
  }

  async function approveWithdrawal(id: string) {
    const res = await fetch(`/api/admin/withdrawals/${id}/approve`, {
      method: "POST",
    });
    if (!res.ok) alert("Approve failed");
    load();
  }

  async function rejectWithdrawal(id: string) {
    const res = await fetch(`/api/admin/withdrawals/${id}/reject`, {
      method: "POST",
    });
    if (!res.ok) alert("Reject failed");
    load();
  }

  async function resetUserPassword() {
    if (!resetUserId || resetPassword.length < 6) {
      alert("Pick a user and enter a password (min 6 characters)");
      return;
    }
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: resetUserId, newPassword: resetPassword }),
    });
    if (!res.ok) {
      alert("Reset failed");
      return;
    }
    setResetPassword("");
    alert("Password updated — share the new password with the user.");
  }

  return (
    <div className="space-y-8 pb-8">
      <h1 className="text-2xl font-bold">Admin</h1>

      <section className="card space-y-3 p-5">
        <h2 className="font-bold">Wallets & referral %</h2>
        <label className="block text-sm">USDT BEP20 deposit wallet</label>
        <input
          className="w-full rounded border px-3 py-2 font-mono text-sm"
          value={depositWalletBep20}
          onChange={(e) => setDepositWalletBep20(e.target.value)}
        />
        <label className="block text-sm">USDT TRC20 deposit wallet</label>
        <input
          className="w-full rounded border px-3 py-2 font-mono text-sm"
          value={depositWalletTrc20}
          onChange={(e) => setDepositWalletTrc20(e.target.value)}
        />
        <label className="block text-sm">
          Admin hot wallet (reference — users enter their own address on withdraw)
        </label>
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
        <h2 className="font-bold">Pending deposits</h2>
        {deposits.length === 0 ? (
          <p className="text-sm text-slate-500">No pending deposits.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {deposits.map((d) => (
              <li
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b py-2"
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{d.userEmail}</span>
                  <span className="block text-slate-600">
                    ${d.amount.toFixed(2)} · {d.network?.toUpperCase() ?? "?"}
                  </span>
                  <span className="block break-all font-mono text-xs text-slate-500">
                    From: {d.senderAddress || "—"}
                  </span>
                  {d.note ? (
                    <span className="block text-xs text-slate-400">{d.note}</span>
                  ) : null}
                </span>
                <span className="flex gap-2">
                  <button
                    type="button"
                    className="text-indigo-600"
                    onClick={() => approveDeposit(d.id)}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="text-red-600"
                    onClick={() => rejectDeposit(d.id)}
                  >
                    Reject
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card space-y-3 p-5">
        <h2 className="font-bold">Pending withdrawals</h2>
        {withdrawals.length === 0 ? (
          <p className="text-sm text-slate-500">No pending withdrawals.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {withdrawals.map((w) => (
              <li
                key={w.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b py-2"
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{w.userEmail}</span>
                  <span className="block text-slate-600">
                    ${w.amount.toFixed(2)} · {w.network?.toUpperCase() ?? "?"}
                  </span>
                  <span className="block break-all font-mono text-xs text-slate-500">
                    To: {w.walletAddress}
                  </span>
                </span>
                <span className="flex gap-2">
                  <button
                    type="button"
                    className="text-indigo-600"
                    onClick={() => approveWithdrawal(w.id)}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="text-red-600"
                    onClick={() => rejectWithdrawal(w.id)}
                  >
                    Reject
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card space-y-3 p-5">
        <h2 className="font-bold">Users</h2>
        <p className="text-xs text-slate-500">
          Passwords are stored encrypted — they cannot be shown. Use reset below
          to set a new password for a user.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-2 pr-2">Email</th>
                <th className="py-2 pr-2">Balance</th>
                <th className="py-2 pr-2">Referred by</th>
                <th className="py-2">Invites</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b">
                  <td className="py-2 pr-2 font-mono">{u.email}</td>
                  <td className="py-2 pr-2">${u.balance.toFixed(2)}</td>
                  <td className="py-2 pr-2">{u.referredByEmail ?? "—"}</td>
                  <td className="py-2">{u.referralsCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-end gap-2 border-t pt-3">
          <label className="block text-sm">
            Reset password for
            <select
              className="mt-1 block w-full min-w-[200px] rounded border px-2 py-1"
              value={resetUserId}
              onChange={(e) => setResetUserId(e.target.value)}
            >
              <option value="">Select user</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.email}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            New password
            <input
              type="text"
              className="mt-1 block rounded border px-2 py-1"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              minLength={6}
            />
          </label>
          <button
            type="button"
            onClick={resetUserPassword}
            className="rounded-lg bg-slate-800 px-4 py-2 text-white"
          >
            Reset password
          </button>
        </div>
      </section>

      <section className="card space-y-3 p-5">
        <h2 className="font-bold">Plans</h2>
        <ul className="space-y-3 text-sm">
          {plans.map((p) => (
            <li key={p.id} className="border-b pb-3">
              {editingId === p.id ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    className="rounded border px-2 py-1"
                    value={editPlan.nameEn}
                    onChange={(e) =>
                      setEditPlan({ ...editPlan, nameEn: e.target.value })
                    }
                  />
                  <input
                    className="rounded border px-2 py-1"
                    value={editPlan.nameAr}
                    onChange={(e) =>
                      setEditPlan({ ...editPlan, nameAr: e.target.value })
                    }
                  />
                  <input
                    className="rounded border px-2 py-1"
                    value={editPlan.priceUsd}
                    onChange={(e) =>
                      setEditPlan({ ...editPlan, priceUsd: e.target.value })
                    }
                  />
                  <input
                    className="rounded border px-2 py-1"
                    value={editPlan.dailyProfitUsd}
                    onChange={(e) =>
                      setEditPlan({
                        ...editPlan,
                        dailyProfitUsd: e.target.value,
                      })
                    }
                  />
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editPlan.active}
                      onChange={(e) =>
                        setEditPlan({ ...editPlan, active: e.target.checked })
                      }
                    />
                    Active
                  </label>
                  <span className="flex gap-2">
                    <button
                      type="button"
                      className="text-indigo-600"
                      onClick={saveEdit}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="text-slate-500"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </span>
                </div>
              ) : (
                <div className="flex flex-wrap justify-between gap-2">
                  <span>
                    {p.nameEn} / {p.nameAr} — ${p.priceUsd} → $
                    {p.dailyProfitUsd}/day
                    {!p.active && (
                      <span className="ml-2 text-amber-600">(inactive)</span>
                    )}
                  </span>
                  <span className="flex gap-3">
                    <button
                      type="button"
                      className="text-indigo-600"
                      onClick={() => startEdit(p)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-red-600"
                      onClick={() => deletePlan(p.id)}
                    >
                      Delete
                    </button>
                  </span>
                </div>
              )}
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
    </div>
  );
}
