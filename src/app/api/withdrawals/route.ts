import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { hasUnlimitedBalance } from "@/lib/balance";
import { MIN_WITHDRAWAL_USD } from "@/lib/platform-rules";

const schema = z.object({
  amount: z.number().min(MIN_WITHDRAWAL_USD),
  walletAddress: z.string().min(8),
});

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "min_withdrawal", min: MIN_WITHDRAWAL_USD },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const unlimited = hasUnlimitedBalance(user);
  if (!unlimited && user.balance < parsed.data.amount) {
    return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    if (!unlimited) {
      await tx.user.update({
        where: { id: userId },
        data: { balance: { decrement: parsed.data.amount } },
      });
    }
    await tx.withdrawal.create({
      data: {
        userId,
        amount: parsed.data.amount,
        walletAddress: parsed.data.walletAddress,
        status: "pending",
      },
    });
    await tx.transaction.create({
      data: {
        userId,
        type: "withdrawal",
        amount: unlimited ? 0 : -parsed.data.amount,
        meta: unlimited ? JSON.stringify({ unlimited: true }) : undefined,
      },
    });
  });

  return NextResponse.json({ ok: true });
}
