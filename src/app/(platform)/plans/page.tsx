import { getLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { PlansClient } from "./PlansClient";

export default async function PlansPage() {
  const locale = await getLocale();
  const plans = await prisma.plan.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t(locale, "plansTitle")}</h1>
        <p className="mt-1 text-slate-600">{t(locale, "plansSubtitle")}</p>
      </div>
      <PlansClient
        locale={locale}
        plans={plans.map((p) => ({
          id: p.id,
          name: locale === "ar" ? p.nameAr : p.nameEn,
          priceUsd: p.priceUsd,
          dailyProfitUsd: p.dailyProfitUsd,
        }))}
      />
    </div>
  );
}
