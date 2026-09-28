import { getLocale } from "@/lib/locale";
import type { Locale } from "@/lib/i18n";
import { resolveSupportTelegramUrl } from "@/lib/support";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SupportLink } from "@/components/SupportLink";

type Variant = "auth" | "default";

export async function LocaleSupportBar({ variant = "default" }: { variant?: Variant }) {
  const locale = (await getLocale()) as Locale;
  const supportUrl = await resolveSupportTelegramUrl();

  return (
    <div className="flex items-center gap-2">
      <LanguageSwitcher locale={locale} variant={variant} />
      <SupportLink locale={locale} href={supportUrl} variant={variant} />
    </div>
  );
}
