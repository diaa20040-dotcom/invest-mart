import Link from "next/link";
import { getLocale } from "@/lib/locale";
import { t, type Locale } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/auth";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { BottomNav } from "./BottomNav";
import { SideNav } from "./SideNav";
import { LogoutButton } from "./LogoutButton";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const user = await getCurrentUser();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <div dir={dir} lang={locale} className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="text-lg font-bold text-emerald-800">
            {t(locale, "appName")}
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher locale={locale} />
            {user ? (
              <>
                {user.isAdmin && (
                  <Link
                    href="/admin"
                    className="hidden rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-white sm:inline"
                  >
                    Admin
                  </Link>
                )}
                <span className="hidden text-sm text-slate-600 sm:inline">
                  ${user.balance.toFixed(2)}
                </span>
                <LogoutButton locale={locale as Locale} />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-600"
                >
                  {t(locale, "login")}
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white"
                >
                  {t(locale, "register")}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-5xl gap-8 px-4 pb-24 pt-6 md:pb-8">
        <SideNav locale={locale as Locale} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <BottomNav locale={locale as Locale} />
    </div>
  );
}
