import { redirect } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DepositForm } from "./DepositForm";

export default async function DepositPage() {
  const locale = await getLocale();
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const settings = await prisma.siteSetting.findUnique({ where: { id: 1 } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t(locale, "depositTitle")}</h1>
        <p className="mt-1 text-slate-600">{t(locale, "depositSubtitle")}</p>
      </div>
      <div className="card p-5">
        <p className="text-sm font-medium text-slate-500">
          {t(locale, "depositWallet")}
        </p>
        <p className="mt-2 break-all rounded-lg bg-slate-100 p-3 font-mono text-sm">
          {settings?.depositWallet}
        </p>
      </div>
      <DepositForm locale={locale} />
    </div>
  );
}
