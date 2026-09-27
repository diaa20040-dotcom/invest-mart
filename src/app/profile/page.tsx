import { redirect } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileActions } from "./ProfileActions";

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{t(locale, "navProfile")}</h1>
        <p className="mt-2 text-lg">
          {t(locale, "balance")}:{" "}
          <span className="font-bold text-indigo-600">
            ${user.balance.toFixed(2)}
          </span>
        </p>
        <p className="text-sm text-slate-500">{user.email}</p>
      </div>

      <ProfileActions
        locale={locale}
        payoutWallet={settings?.withdrawWallet ?? ""}
      />

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
