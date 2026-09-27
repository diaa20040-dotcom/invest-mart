import { redirect } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReferralCopy } from "./ReferralCopy";

export default async function ReferralsPage() {
  const locale = await getLocale();
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const invitedCount = await prisma.user.count({
    where: { referredById: user.id },
  });

  const referralTx = await prisma.transaction.aggregate({
    where: { userId: user.id, type: "referral" },
    _sum: { amount: true },
  });

  const settings = await prisma.siteSetting.findUnique({ where: { id: 1 } });
  const percent = settings?.referralPercent ?? 10;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t(locale, "referralsTitle")}</h1>
        <p className="mt-1 text-slate-600">
          {locale === "ar"
            ? `احصل على ${percent}٪ من كل إيداع يقوم به من دعوتهم.`
            : `Earn ${percent}% of every deposit your invitees make.`}
        </p>
      </div>
      <ReferralCopy locale={locale} code={user.referralCode} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <p className="text-sm text-slate-500">{t(locale, "invitedCount")}</p>
          <p className="text-3xl font-bold">{invitedCount}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-500">{t(locale, "referralEarnings")}</p>
          <p className="text-3xl font-bold text-indigo-600">
            ${(referralTx._sum.amount ?? 0).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
