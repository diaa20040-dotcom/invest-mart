import { cookies } from "next/headers";
import type { Locale } from "./i18n";

export const LOCALE_COOKIE = "invest_locale";

export async function getLocale(): Promise<Locale> {
  const jar = await cookies();
  const v = jar.get(LOCALE_COOKIE)?.value;
  return v === "ar" ? "ar" : "en";
}
