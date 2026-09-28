import { NextResponse } from "next/server";
import { LOCALE_COOKIE } from "@/lib/locale";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const locale = body.locale === "ar" ? "ar" : "en";
  const res = NextResponse.json({ ok: true });
  res.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
