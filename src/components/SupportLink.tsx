import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

type Variant = "auth" | "default";

export function SupportLink({
  locale,
  href,
  variant = "default",
}: {
  locale: Locale;
  href: string;
  variant?: Variant;
}) {
  if (!href) return null;

  const className =
    variant === "auth"
      ? "inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
      : "inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={t(locale, "support")}
    >
      <span aria-hidden className="text-base leading-none">✈</span>
      {t(locale, "support")}
    </a>
  );
}
