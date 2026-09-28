"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

export function WalletCopy({
  locale,
  label,
  address,
}: {
  locale: Locale;
  label: string;
  address: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-medium text-slate-700">{label}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <code className="break-all rounded-lg bg-white px-3 py-2 text-xs font-mono sm:text-sm">
          {address}
        </code>
        <button
          type="button"
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white"
          onClick={async () => {
            await navigator.clipboard.writeText(address);
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
