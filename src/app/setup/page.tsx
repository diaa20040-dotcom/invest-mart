import Link from "next/link";
import { SetupBootstrapForm } from "./SetupBootstrapForm";

export const dynamic = "force-dynamic";

async function getHealth() {
  try {
    const base =
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const res = await fetch(`${base}/api/health/db`, { cache: "no-store" });
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return { ok: false, reason: "fetch_failed" };
  }
}

export default async function SetupPage() {
  const health = await getHealth();
  const ok = health.ok === true;

  return (
    <main className="mx-auto max-w-lg px-4 py-10 text-white">
      <h1 className="text-2xl font-semibold">إعداد قاعدة البيانات</h1>
      <p className="mt-2 text-sm text-slate-300">
        إذا ظهرت رسالة «قاعدة البيانات غير متصلة» في تسجيل الدخول، اتبع الخطوات
        هنا.
      </p>

      <div
        className={`mt-6 rounded-xl border p-4 text-sm ${
          ok
            ? "border-emerald-500/40 bg-emerald-500/10"
            : "border-rose-500/40 bg-rose-500/10"
        }`}
      >
        <p className="font-medium">{ok ? "الاتصال: ناجح ✓" : "الاتصال: فاشل ✗"}</p>
        {!ok && health.reason ? (
          <p className="mt-2 text-slate-200">
            السبب: <code className="text-indigo-200">{String(health.reason)}</code>
            {health.connectError ? (
              <>
                {" "}
                (
                <code className="text-indigo-200">{String(health.connectError)}</code>
                )
              </>
            ) : null}
          </p>
        ) : null}
        {health.hint ? (
          <p className="mt-2 text-slate-300">{String(health.hint)}</p>
        ) : null}
      </div>

      <ol className="mt-8 list-decimal space-y-3 ps-5 text-sm text-slate-200">
        <li>
          Vercel → Settings → Environment Variables → Production:{" "}
          <code>DATABASE_URL</code>, <code>TURSO_AUTH_TOKEN</code>,{" "}
          <code>JWT_SECRET</code>, <code>SETUP_SECRET</code>
        </li>
        <li>Redeploy ثم افتح{" "}
          <Link className="text-indigo-300 underline" href="/api/health/db">
            /api/health/db
          </Link>
        </li>
        <li>
          مرة واحدة: POST إلى{" "}
          <code className="text-indigo-200">/api/setup/bootstrap</code> مع{" "}
          <code>{`{ "secret": "SETUP_SECRET" }`}</code>
        </li>
        <li>
          <Link className="text-indigo-300 underline" href="/login">
            تسجيل الدخول
          </Link>
        </li>
      </ol>

      <SetupBootstrapForm />
    </main>
  );
}
