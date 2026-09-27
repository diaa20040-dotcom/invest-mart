import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

const schema = z.object({
  amount: z.number().positive(),
  walletAddress: z.string().min(8),
});

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.balance < parsed.data.amount) {
    return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { balance: { decrement: parsed.data.amount } },
    }),
    prisma.withdrawal.create({
      data: {
        userId,
        amount: parsed.data.amount,
        walletAddress: parsed.data.walletAddress,
        status: "pending",
      },
    }),
    prisma.transaction.create({
      data: {
        userId,
        type: "withdrawal",
        amount: -parsed.data.amount,
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
