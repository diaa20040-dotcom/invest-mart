import { prisma } from "@/lib/prisma";
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

export function supportTelegramFromEnv(): string {
  return normalizeTelegramUrl(process.env.NEXT_PUBLIC_SUPPORT_TELEGRAM_URL ?? "");
}

export async function resolveSupportTelegramUrl(): Promise<string> {
  const fromEnv = supportTelegramFromEnv();
  if (fromEnv) return fromEnv;
  try {
    const settings = await prisma.siteSetting.findUnique({ where: { id: 1 } });
    if (settings?.supportTelegramUrl) {
      return normalizeTelegramUrl(settings.supportTelegramUrl);
    }
  } catch {
    /* db unavailable */
  }
  return "";
}
