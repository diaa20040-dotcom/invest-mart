"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

const items = [
  { href: "/", key: "navHome" as const },
  { href: "/plans", key: "navPlans" as const },
  { href: "/referrals", key: "navReferrals" as const },
  { href: "/deposit", key: "navDeposit" as const },
  { href: "/profile", key: "navProfile" as const },
];

export function SideNav({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  return (
    <aside className="hidden w-56 shrink-0 md:block">
      <ul className="sticky top-24 space-y-1">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block rounded-xl px-4 py-2.5 text-sm font-medium ${
                  active
                    ? "bg-emerald-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {t(locale, item.key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
