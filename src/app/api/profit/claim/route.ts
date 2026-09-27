import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

function isSameUtcDay(a: Date, b: Date) {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

export async function POST() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const activePlans = await prisma.userPlan.findMany({
    where: { userId },
    include: { plan: true },
  });

  let total = 0;

  for (const up of activePlans) {
    if (!up.plan.active) continue;
    if (up.lastClaimedAt && isSameUtcDay(up.lastClaimedAt, now)) continue;
    total += up.plan.dailyProfitUsd;
  }

  if (total <= 0) {
    return NextResponse.json(
      { error: "already_claimed_or_no_plan" },
      { status: 400 }
    );
  }

  await prisma.$transaction(async (tx) => {
    for (const up of activePlans) {
      if (!up.plan.active) continue;
      if (up.lastClaimedAt && isSameUtcDay(up.lastClaimedAt, now)) continue;
      await tx.userPlan.update({
        where: { id: up.id },
        data: { lastClaimedAt: now },
      });
    }
    await tx.user.update({
      where: { id: userId },
      data: { balance: { increment: total } },
    });
    await tx.transaction.create({
      data: {
        userId,
        type: "daily_profit",
        amount: total,
      },
    });
  });

  return NextResponse.json({ ok: true, amount: total });
}
