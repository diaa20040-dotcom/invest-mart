import Link from "next/link";
import { BrandLogo } from "./BrandLogo";
import { getLocale } from "@/lib/locale";
import { t, type Locale } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/admin";
import { formatBalance } from "@/lib/balance";
import { BottomNav } from "./BottomNav";
import { SideNav } from "./SideNav";
import { LogoutButton } from "./LogoutButton";
import { LocaleSupportBar } from "./LocaleSupportBar";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const user = await getCurrentUser();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <div
      dir={dir}
      lang={locale}
      className="min-h-screen bg-[#fafafa] text-slate-900"
    >
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3.5">
          <BrandLogo locale={locale as Locale} variant="header" />
          <div className="flex items-center gap-2">
            <LocaleSupportBar variant="default" />
            {user && (
              <>
                {canAccessAdmin(user) && (
                  <Link
                    href="/admin"
                    className="rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white sm:px-3 sm:text-sm"
                  >
                    {t(locale, "navAdmin")}
                  </Link>
                )}
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 sm:px-2.5 sm:py-1 sm:text-sm">
                  {formatBalance(user, locale as Locale)}
                </span>
                <LogoutButton locale={locale as Locale} />
              </>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-5xl gap-8 px-4 pb-28 pt-6 md:pb-8">
        <SideNav locale={locale as Locale} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <BottomNav locale={locale as Locale} />
    </div>
  );
}
