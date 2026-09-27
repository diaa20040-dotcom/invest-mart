import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

type Tx = { type: string; amount: number; createdAt: Date };

export function HomeOverview({
  locale,
  showAdmin,
  user,
  activePlansCount,
  dailyProfitUsd,
  referralEarnings,
  invitedCount,
  recentTx,
}: {
  locale: Locale;
  showAdmin?: boolean;
  user: { name: string | null; email: string; balance: number; referralCode: string };
  activePlansCount: number;
  dailyProfitUsd: number;
  referralEarnings: number;
  invitedCount: number;
  recentTx: Tx[];
}) {
  const name = user.name || user.email.split("@")[0];

  const quick = [
    { href: "/deposit", label: t(locale, "navDeposit"), icon: "↓" },
    { href: "/plans", label: t(locale, "navPlans"), icon: "◆" },
    { href: "/referrals", label: t(locale, "navReferrals"), icon: "◎" },
    { href: "/profile", label: t(locale, "navProfile"), icon: "☰" },
  ];

  return (
    <div className="space-y-6">
      <section className="card overflow-hidden p-0">
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 px-5 py-6 text-white">
          <p className="text-sm text-indigo-100">
            {t(locale, "homeWelcome")}, {name}
          </p>
          <p className="mt-1 text-sm text-indigo-200/90">{t(locale, "homeBalanceLabel")}</p>
          <p className="mt-2 text-4xl font-semibold tracking-tight">
            ${user.balance.toFixed(2)}
          </p>
        </div>
        <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 bg-white rtl:divide-x-reverse">
          <div className="px-4 py-4 text-center">
            <p className="text-lg font-semibold text-slate-900">{activePlansCount}</p>
            <p className="text-xs text-slate-500">{t(locale, "homeActivePlans")}</p>
          </div>
          <div className="px-4 py-4 text-center">
            <p className="text-lg font-semibold text-indigo-600">
              ${dailyProfitUsd.toFixed(0)}
            </p>
            <p className="text-xs text-slate-500">{t(locale, "homeDailyProfit")}</p>
          </div>
          <div className="px-4 py-4 text-center">
            <p className="text-lg font-semibold text-slate-900">
              ${referralEarnings.toFixed(2)}
            </p>
            <p className="text-xs text-slate-500">{t(locale, "referralEarnings")}</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium text-slate-500">
          {t(locale, "homeQuickActions")}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quick.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="card flex flex-col items-center gap-2 px-3 py-4 text-center transition hover:border-indigo-200 hover:shadow-md"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-lg text-indigo-600">
                {item.icon}
              </span>
              <span className="text-sm font-medium text-slate-800">{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm text-slate-500">{t(locale, "yourCode")}</p>
            <p className="font-mono text-lg font-semibold tracking-wider text-slate-900">
              {user.referralCode}
            </p>
          </div>
          <p className="text-sm text-slate-500">
            {t(locale, "invitedCount")}:{" "}
            <span className="font-semibold text-slate-800">{invitedCount}</span>
          </p>
        </div>
      </section>

      {recentTx.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium text-slate-500">
            {t(locale, "history")}
          </h2>
          <ul className="card divide-y divide-slate-100">
            {recentTx.map((tx, i) => (
              <li
                key={`${tx.type}-${tx.createdAt.toISOString()}-${i}`}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <span className="text-slate-600">{tx.type}</span>
                <span
                  className={
                    tx.amount >= 0 ? "font-medium text-indigo-600" : "font-medium text-red-500"
                  }
                >
                  {tx.amount >= 0 ? "+" : ""}
                  {tx.amount.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
          <Link
            href="/profile"
            className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            {t(locale, "homeViewAll")}
          </Link>
        </section>
      )}
    </div>
  );
}

export function HomeGuest({ locale }: { locale: Locale }) {
  return (
    <section className="card p-6">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
        {t(locale, "homeGuestTitle")}
      </h1>
      <p className="mt-2 max-w-md text-slate-600">{t(locale, "homeGuestSubtitle")}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/register"
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
        >
          {t(locale, "register")}
        </Link>
        <Link
          href="/login"
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          {t(locale, "login")}
        </Link>
      </div>
    </section>
  );
}
