import Link from "next/link";
import { getLocale } from "@/lib/locale";
import { t, type Locale } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/admin";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { BottomNav } from "./BottomNav";
import { SideNav } from "./SideNav";
import { LogoutButton } from "./LogoutButton";

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
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-slate-900"
          >
            {t(locale, "appName")}
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher locale={locale} />
            {user ? (
              <>
                {canAccessAdmin(user) && (
                  <Link
                    href="/admin"
                    className="hidden rounded-lg bg-slate-900 px-3 py-1.5 text-sm text-white sm:inline"
                  >
                    Admin
                  </Link>
                )}
                <span className="hidden rounded-full bg-slate-100 px-2.5 py-1 text-sm font-medium text-slate-700 sm:inline">
                  ${user.balance.toFixed(2)}
                </span>
                <LogoutButton locale={locale as Locale} />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  {t(locale, "login")}
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                >
                  {t(locale, "register")}
                </Link>
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
