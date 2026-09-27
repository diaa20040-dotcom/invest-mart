import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { creditReferralBonus } from "@/lib/referral";

const schema = z.object({
  amount: z.number().positive(),
  note: z.string().optional(),
});

const DEMO_AUTO_APPROVE = true;

async function approveDeposit(depositId: string) {
  const deposit = await prisma.deposit.findUnique({ where: { id: depositId } });
  if (!deposit || deposit.status !== "pending") return;

  await prisma.$transaction(async (tx) => {
    await tx.deposit.update({
      where: { id: depositId },
      data: { status: "approved" },
    });
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
}

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const deposit = await prisma.deposit.create({
    data: {
      userId,
      amount: parsed.data.amount,
      note: parsed.data.note,
      status: DEMO_AUTO_APPROVE ? "pending" : "pending",
    },
  });

  if (DEMO_AUTO_APPROVE) {
    setTimeout(() => {
      approveDeposit(deposit.id).catch(console.error);
    }, 2500);
  }

  return NextResponse.json({ ok: true, id: deposit.id, demoAuto: DEMO_AUTO_APPROVE });
}
