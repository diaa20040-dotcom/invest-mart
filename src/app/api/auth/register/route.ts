import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  generateUniqueReferralCode,
  hashPassword,
} from "@/lib/auth";
import { SIGNUP_BONUS_USD } from "@/lib/platform-rules";

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

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  let referredById: string | undefined;
  if (referralCode?.trim()) {
    const referrer = await prisma.user.findUnique({
      where: { referralCode: referralCode.trim().toUpperCase() },
    });
    if (referrer) referredById = referrer.id;
  }

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        email,
        passwordHash: await hashPassword(password),
        name: name || null,
        referralCode: await generateUniqueReferralCode(),
        referredById,
        balance: SIGNUP_BONUS_USD,
      },
    });
    await tx.transaction.create({
      data: {
        userId: created.id,
        type: "signup_bonus",
        amount: SIGNUP_BONUS_USD,
      },
    });
    return created;
  });

  await createSession(user.id);
  return NextResponse.json({ ok: true });
}
