import { isOwnerAdmin } from "@/lib/admin";
import type { Locale } from "@/lib/i18n";

/** Stored balance for owner (displayed as unlimited). */
export const OWNER_STORED_BALANCE = 999_999_999_999;

export function hasUnlimitedBalance(user: { email: string } | null | undefined) {
  return Boolean(user && isOwnerAdmin(user.email));
}

export function formatBalance(
  user: { email: string; balance: number },
  locale: Locale = "en"
): string {
  if (hasUnlimitedBalance(user)) {
    return locale === "ar" ? "∞ غير محدود" : "∞ Unlimited";
  }
  return `$${user.balance.toFixed(2)}`;
}
