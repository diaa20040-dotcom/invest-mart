"use client";

import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

export function LogoutButton({ locale }: { locale: Locale }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.refresh();
        router.push("/");
      }}
    >
      {t(locale, "logout")}
    </button>
  );
}
