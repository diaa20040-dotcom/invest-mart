import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { hasUnlimitedBalance } from "@/lib/balance";
import { MIN_WITHDRAWAL_USD } from "@/lib/platform-rules";
import {
  type DepositNetwork,
  isValidSenderAddress,
} from "@/lib/deposit-networks";

const schema = z.object({
  amount: z.number().min(MIN_WITHDRAWAL_USD),
  network: z.enum(["bep20", "trc20"]),
  walletAddress: z.string().min(10).max(120),
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

  const network = parsed.data.network as DepositNetwork;
  const wallet = parsed.data.walletAddress.trim();
  if (!isValidSenderAddress(network, wallet)) {
    return NextResponse.json({ error: "invalid_wallet" }, { status: 400 });
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
        network,
        walletAddress: wallet,
        status: "pending",
      },
    });
    await tx.transaction.create({
      data: {
        userId,
        type: "withdrawal",
        amount: unlimited ? 0 : -parsed.data.amount,
        meta: JSON.stringify({ network, walletAddress: wallet }),
      },
    });
  });

  return NextResponse.json({ ok: true });
}
