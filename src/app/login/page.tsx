"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      setError("Login failed");
      return;
    }
    router.push("/profile");
    router.refresh();
  }

  return (
    <div className="card mx-auto max-w-md p-6">
      <h1 className="text-xl font-bold">Log in</h1>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
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
          placeholder="Password"
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-xl bg-indigo-600 py-2.5 font-medium text-white shadow-sm hover:bg-indigo-700"
        >
          Log in
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">
        <Link href="/register" className="text-indigo-600">Create account</Link>
      </p>
    </div>
  );
}
