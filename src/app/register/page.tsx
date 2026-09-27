"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
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
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Registration failed");
      return;
    }
    router.push("/profile");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold">Sign up</h1>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <input
          type="text"
          placeholder="Name"
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          required
          placeholder="Email"
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Password"
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="text"
          placeholder="Referral code (optional)"
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-lg bg-emerald-600 py-2 font-medium text-white"
        >
          Register
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">
        <Link href="/login" className="text-emerald-700">Already have an account?</Link>
      </p>
    </div>
  );
}
