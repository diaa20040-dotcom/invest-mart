import { Suspense } from "react";
import { getLocale } from "@/lib/locale";
import type { Locale } from "@/lib/i18n";
import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage() {
  const locale = (await getLocale()) as Locale;
  return (
    <Suspense fallback={<div className="min-h-[40vh]" />}>
      <LoginForm locale={locale} />
    </Suspense>
  );
}
