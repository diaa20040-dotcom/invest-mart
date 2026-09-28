"use client";

import { useRouter } from "next/navigation";

export function LanguageSwitcher({
  locale,
  variant = "default",
}: {
  locale: "ar" | "en";
  variant?: "auth" | "default";
}) {
  const router = useRouter();
  const next = locale === "ar" ? "en" : "ar";

  const className =
    variant === "auth"
      ? "rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
      : "rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50";

  return (
    <button
      type="button"
      title={locale === "ar" ? "English" : "العربية"}
      onClick={async () => {
        const res = await fetch("/api/locale", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locale: next }),
          credentials: "same-origin",
        });
        if (!res.ok) return;
        router.refresh();
      }}
      className={className}
    >
      {locale === "ar" ? "EN" : "عربي"}
    </button>
  );
}
