import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  generateUniqueReferralCode,
  hashPassword,
} from "@/lib/auth";
export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  referralCode: z.string().optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { email, password, name, referralCode } = parsed.data;

  try {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    let referredById: string | undefined;
    if (referralCode?.trim()) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: referralCode.trim().toUpperCase() },
      });
      if (referrer) referredById = referrer.id;
    }

    const passwordHash = await hashPassword(password);
    const newReferralCode = await generateUniqueReferralCode();

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name || null,
        referralCode: newReferralCode,
        referredById,
      },
    });

    await createSession(user.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("register", e);
    return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
  }
}
