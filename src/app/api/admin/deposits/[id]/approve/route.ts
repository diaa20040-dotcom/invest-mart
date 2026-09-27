import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { creditReferralBonus } from "@/lib/referral";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const deposit = await prisma.deposit.findUnique({ where: { id } });
  if (!deposit || deposit.status !== "pending") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.deposit.update({ where: { id }, data: { status: "approved" } });
    await tx.user.update({
      where: { id: deposit.userId },
      data: { balance: { increment: deposit.amount } },
    });
    await tx.transaction.create({
      data: {
        userId: deposit.userId,
        type: "deposit",
        amount: deposit.amount,
      },
    });
  });

  await creditReferralBonus(deposit.userId, deposit.amount);
  return NextResponse.json({ ok: true });
}
