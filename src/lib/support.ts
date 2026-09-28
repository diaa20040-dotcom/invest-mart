import { cleanEnv } from "@/lib/turso-client";

/** Normalize @username, t.me/foo, or full https URL. */
export function normalizeTelegramUrl(raw: string): string {
  const t = cleanEnv(raw);
  if (!t) return "";
  if (t.startsWith("@")) return `https://t.me/${t.slice(1)}`;
  if (t.startsWith("t.me/")) return `https://${t}`;
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  return `https://t.me/${t.replace(/^\/+/, "")}`;
}

export const DEFAULT_SUPPORT_TELEGRAM = "https://t.me/Invest_Mart_support";

export function supportTelegramFromEnv(): string {
  return normalizeTelegramUrl(process.env.NEXT_PUBLIC_SUPPORT_TELEGRAM_URL ?? "");
}

export async function resolveSupportTelegramUrl(): Promise<string> {
  const fromEnv = supportTelegramFromEnv();
  return fromEnv || DEFAULT_SUPPORT_TELEGRAM;
}
