import { redirect } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/admin";
import { formatBalance } from "@/lib/balance";
import { prisma } from "@/lib/prisma";
import { ProfileActions } from "./ProfileActions";
import { getProfitClaimStatus } from "@/lib/daily-profit";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import type { Locale } from "@/lib/i18n";

export default async function ProfilePage() {
  const locale = await getLocale();
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const settings = await prisma.siteSetting.findUnique({ where: { id: 1 } });
  const userPlans = await prisma.userPlan.findMany({
    where: { userId: user.id },
    include: { plan: true },
    orderBy: { purchasedAt: "desc" },
  });
  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 15,
  });

  const profitStatus = getProfitClaimStatus(
    userPlans.map((up) => ({
      active: up.plan.active,
      dailyProfitUsd: up.plan.dailyProfitUsd,
      lastClaimedAt: up.lastClaimedAt,
    }))
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{t(locale, "navProfile")}</h1>
        <p className="mt-2 text-lg">
          {t(locale, "balance")}:{" "}
          <span className="font-bold text-indigo-600">
            {formatBalance(user, locale)}
          </span>
        </p>
        <p className="text-sm text-slate-500">{user.email}</p>
      </div>

      {canAccessAdmin(user) && (
        <Link
          href="/admin"
          className="card flex items-center justify-between gap-3 border-indigo-200 bg-indigo-50/80 px-4 py-4 transition hover:border-indigo-300 hover:shadow-md"
        >
          <div>
            <p className="font-semibold text-slate-900">{t(locale, "adminTitle")}</p>
            <p className="text-sm text-slate-600">
              {locale === "ar"
                ? "إدارة الخطط والمحافظ والإيداعات"
                : "Manage plans, wallets, and deposits"}
            </p>
          </div>
          <span className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-medium text-white">
            {t(locale, "navAdmin")}
          </span>
        </Link>
      )}

      <ProfileActions
        locale={locale}
        payoutWallet={settings?.withdrawWallet ?? ""}
        canClaim={profitStatus.canClaim}
        claimableAmount={profitStatus.claimableTotal}
        nextClaimAtIso={profitStatus.nextClaimAt?.toISOString() ?? null}
        hasActivePlan={profitStatus.hasActivePlan}
      />

      <section className="card p-5">
        <h2 className="font-bold">{t(locale, "languageSettings")}</h2>
        <p className="mt-1 text-sm text-slate-500">{t(locale, "languageSettingsHint")}</p>
        <div className="mt-4">
          <LanguageSwitcher locale={locale as Locale} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-bold">{t(locale, "myPlans")}</h2>
        {userPlans.length === 0 ? (
          <p className="text-slate-500">{t(locale, "noActivePlan")}</p>
        ) : (
          <ul className="space-y-2">
            {userPlans.map((up) => (
              <li
                key={up.id}
                className="card px-4 py-3 text-sm"
              >
                {locale === "ar" ? up.plan.nameAr : up.plan.nameEn} — $
                {up.plan.dailyProfitUsd}/{locale === "ar" ? "يوم" : "day"}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-bold">{t(locale, "history")}</h2>
        <ul className="card divide-y divide-slate-100">
          {transactions.map((tx) => (
            <li
              key={tx.id}
              className="flex justify-between px-4 py-2 text-sm"
            >
              <span>{tx.type}</span>
              <span className={tx.amount >= 0 ? "text-indigo-600" : "text-red-500"}>
                {tx.amount >= 0 ? "+" : ""}
                {tx.amount.toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
