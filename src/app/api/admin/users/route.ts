import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/admin";

export async function GET() {
  const user = await getCurrentUser();
  if (!canAccessAdmin(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      balance: true,
      referralCode: true,
      isAdmin: true,
      createdAt: true,
      referredBy: { select: { email: true } },
      _count: { select: { referrals: true } },
    },
  });

  return NextResponse.json(
    users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      balance: u.balance,
      referralCode: u.referralCode,
      isAdmin: u.isAdmin,
      createdAt: u.createdAt,
      referredByEmail: u.referredBy?.email ?? null,
      referralsCount: u._count.referrals,
    }))
  );
}

const resetSchema = z.object({
  userId: z.string().min(1),
  newPassword: z.string().min(6),
});

export async function PATCH(req: Request) {
  const admin = await getCurrentUser();
  if (!canAccessAdmin(admin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = resetSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }
  const { userId, newPassword } = parsed.data;

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(newPassword) },
  });

  return NextResponse.json({ ok: true });
}
