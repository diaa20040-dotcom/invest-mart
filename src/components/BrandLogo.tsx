import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

type Props = {
  locale: Locale;
  href?: string;
  variant?: "auth" | "header";
};

export function BrandLogo({ locale, href = "/", variant = "header" }: Props) {
  const size = variant === "auth" ? 120 : 40;
  const className =
    variant === "auth"
      ? "mx-auto block"
      : "flex items-center gap-2.5 text-lg font-semibold tracking-tight text-slate-900";

  const image = (
    <Image
      src="/images/logo.png"
      alt={t(locale, "appName")}
      width={size}
      height={size}
      className={
        variant === "auth"
          ? "h-28 w-28 rounded-2xl object-contain sm:h-32 sm:w-32"
          : "h-9 w-9 rounded-lg object-contain"
      }
      priority
    />
  );

  if (variant === "auth") {
    return (
      <div className={className}>
        {href ? (
          <Link href={href} className="inline-block">{image}</Link>
        ) : (
          image
        )}
      </div>
    );
  }

  return (
    <Link href={href} className={className}>
      {image}
      <span className="hidden sm:inline">{t(locale, "appName")}</span>
    </Link>
  );
}
