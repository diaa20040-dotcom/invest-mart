"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

const items = [
  { href: "/", key: "navHome" as const, icon: "🏠" },
  { href: "/plans", key: "navPlans" as const, icon: "📦" },
  { href: "/referrals", key: "navReferrals" as const, icon: "👥" },
  { href: "/deposit", key: "navDeposit" as const, icon: "💳" },
  { href: "/profile", key: "navProfile" as const, icon: "👤" },
];

export function BottomNav({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/80 bg-white/95 shadow-[0_-4px_24px_rgba(15,23,42,0.06)] backdrop-blur-md md:hidden"
      aria-label="Main"
    >
      <ul className="mx-auto flex max-w-lg justify-between px-1 py-2">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-0.5 rounded-lg px-1 py-1 text-[10px] font-medium ${
                  active ? "text-indigo-600" : "text-slate-400"
                }`}
              >
                <span className="text-lg leading-none">{item.icon}</span>
                {t(locale, item.key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
