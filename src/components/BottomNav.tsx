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

export function BottomNav({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-4 pb-4 md:hidden"
      aria-label="Main"
    >
      <div
        className="pointer-events-auto mx-auto max-w-md rounded-2xl border border-slate-200/90 bg-white/90 p-1.5 shadow-[0_8px_32px_rgba(15,23,42,0.12)] backdrop-blur-xl"
      >
        <ul className="flex items-stretch justify-between gap-0.5">
          {items.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const { Icon } = item;
            return (
              <li key={item.href} className="flex-1 min-w-0">
                <Link
                  href={item.href}
                  className={`relative flex flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 transition-all duration-200 ${
                    active
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/25"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 ${active ? "stroke-[2.25px]" : "stroke-[2px]"}`}
                    aria-hidden
                  />
                  <span
                    className={`max-w-full truncate text-[10px] font-semibold leading-none ${
                      active ? "text-white" : ""
                    }`}
                  >
                    {t(locale, item.key)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
