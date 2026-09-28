import { prisma } from "./prisma";

export async function creditReferralBonus(
  depositorId: string,
  depositAmount: number
) {
  const depositor = await prisma.user.findUnique({
    where: { id: depositorId },
    select: { referredById: true },
  });
  if (!depositor?.referredById) return;

  const settings = await prisma.siteSetting.findUnique({ where: { id: 1 } });
  const percent = settings?.referralPercent ?? 25;
  const bonus = (depositAmount * percent) / 100;
  if (bonus <= 0) return;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: depositor.referredById },
      data: { balance: { increment: bonus } },
    }),
    prisma.transaction.create({
      data: {
        userId: depositor.referredById,
        type: "referral",
        amount: bonus,
        meta: JSON.stringify({ fromUserId: depositorId, depositAmount }),
      },
    }),
  ]);
}
