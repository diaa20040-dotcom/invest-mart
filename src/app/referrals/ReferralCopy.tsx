"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

export function ReferralCopy({
  locale,
  code,
}: {
  locale: Locale;
  code: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
      <p className="text-sm font-medium text-emerald-900">{t(locale, "yourCode")}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <code className="rounded-lg bg-white px-3 py-2 text-lg font-bold tracking-widest">
          {code}
        </code>
        <button
          type="button"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
          onClick={async () => {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
        >
          {copied ? t(locale, "copied") : t(locale, "copy")}
        </button>
      </div>
    </div>
  );
}
