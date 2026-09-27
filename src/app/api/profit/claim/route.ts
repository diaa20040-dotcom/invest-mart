import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { canClaimPlan, getProfitClaimStatus } from "@/lib/daily-profit";

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
    if (!canClaimPlan(up.lastClaimedAt, now)) continue;
    total += up.plan.dailyProfitUsd;
  }

  if (total <= 0) {
    const status = getProfitClaimStatus(
      activePlans.map((up) => ({
        active: up.plan.active,
        dailyProfitUsd: up.plan.dailyProfitUsd,
        lastClaimedAt: up.lastClaimedAt,
      })),
      now
    );
    return NextResponse.json(
      {
        error: status.hasActivePlan
          ? "cooldown_active"
          : "already_claimed_or_no_plan",
        nextClaimAt: status.nextClaimAt?.toISOString() ?? null,
      },
      { status: 400 }
    );
  }

  await prisma.$transaction(async (tx) => {
    for (const up of activePlans) {
      if (!up.plan.active) continue;
      if (!canClaimPlan(up.lastClaimedAt, now)) continue;
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
