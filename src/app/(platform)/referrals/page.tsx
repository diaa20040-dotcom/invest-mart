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

  const invitees = await prisma.user.findMany({
    where: { referredById: user.id },
    orderBy: { createdAt: "desc" },
    select: { email: true, createdAt: true, name: true },
  });
  const invitedCount = invitees.length;

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

      <section className="card p-5">
        <h2 className="font-bold">{t(locale, "invitedPeople")}</h2>
        {invitees.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">{t(locale, "noInviteesYet")}</p>
        ) : (
          <ul className="mt-3 divide-y text-sm">
            {invitees.map((inv) => (
              <li key={inv.email} className="flex flex-wrap justify-between gap-2 py-2">
                <span className="font-medium">{inv.email}</span>
                <span className="text-slate-500">
                  {inv.createdAt.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
