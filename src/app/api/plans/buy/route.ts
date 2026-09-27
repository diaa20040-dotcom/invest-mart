import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { hasUnlimitedBalance } from "@/lib/balance";

const schema = z.object({ planId: z.string() });

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const plan = await prisma.plan.findFirst({
    where: { id: parsed.data.planId, active: true },
  });
  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const unlimited = hasUnlimitedBalance(user);
  if (!unlimited && user.balance < plan.priceUsd) {
    return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    if (!unlimited) {
      await tx.user.update({
        where: { id: userId },
        data: { balance: { decrement: plan.priceUsd } },
      });
    }
    await tx.userPlan.create({
      data: { userId, planId: plan.id },
    });
    await tx.transaction.create({
      data: {
        userId,
        type: "plan_purchase",
        amount: unlimited ? 0 : -plan.priceUsd,
        meta: JSON.stringify({ planId: plan.id, unlimited }),
      },
    });
  });

  return NextResponse.json({ ok: true });
}
