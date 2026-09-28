import { redirect } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_DEPOSIT_WALLET_BEP20,
  DEFAULT_DEPOSIT_WALLET_TRC20,
} from "@/lib/deposit-networks";
import { WalletCopy } from "@/components/WalletCopy";
import { DepositForm } from "./DepositForm";

export default async function DepositPage() {
  const locale = await getLocale();
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const settings = await prisma.siteSetting.findUnique({ where: { id: 1 } });
  const bep20 =
    settings?.depositWalletBep20?.trim() || DEFAULT_DEPOSIT_WALLET_BEP20;
  const trc20 =
    settings?.depositWalletTrc20?.trim() || DEFAULT_DEPOSIT_WALLET_TRC20;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t(locale, "depositTitle")}</h1>
        <p className="mt-1 text-slate-600">{t(locale, "depositSubtitle")}</p>
        <p className="mt-2 text-sm text-slate-500">{t(locale, "depositNetworksHint")}</p>
      </div>

      <div className="space-y-3">
        <WalletCopy
          locale={locale}
          label={t(locale, "depositWalletBep20")}
          address={bep20}
        />
        <WalletCopy
          locale={locale}
          label={t(locale, "depositWalletTrc20")}
          address={trc20}
        />
      </div>

      <DepositForm locale={locale} />
    </div>
  );
}
