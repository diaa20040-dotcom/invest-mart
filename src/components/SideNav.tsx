"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutGrid,
  Users,
  Wallet,
  UserRound,
} from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

const items = [
  { href: "/", key: "navHome" as const, Icon: Home },
  { href: "/plans", key: "navPlans" as const, Icon: LayoutGrid },
  { href: "/referrals", key: "navReferrals" as const, Icon: Users },
  { href: "/deposit", key: "navDeposit" as const, Icon: Wallet },
  { href: "/profile", key: "navProfile" as const, Icon: UserRound },
];

export function SideNav({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  return (
    <aside className="hidden w-56 shrink-0 md:block">
      <ul className="sticky top-24 space-y-1 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-sm">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const { Icon } = item;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
                {t(locale, item.key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
