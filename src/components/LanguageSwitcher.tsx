"use client";

import { useRouter } from "next/navigation";

export function LanguageSwitcher({ locale }: { locale: "ar" | "en" }) {
  const router = useRouter();
  const next = locale === "ar" ? "en" : "ar";

  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/locale", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locale: next }),
        });
        router.refresh();
      }}
      className="rounded-full border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
    >
      {locale === "ar" ? "EN" : "عربي"}
    </button>
  );
}
