import { getLocale } from "@/lib/locale";
import type { Locale } from "@/lib/i18n";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default async function RegisterPage() {
  const locale = (await getLocale()) as Locale;
  return <RegisterForm locale={locale} />;
}
