import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function creditReferralBonus(depositorId, depositAmount) {
  const depositor = await prisma.user.findUnique({
    where: { id: depositorId },
    select: { referredById: true },
  });
  if (!depositor?.referredById) return 0;

  const settings = await prisma.siteSetting.findUnique({ where: { id: 1 } });
  const percent = settings?.referralPercent ?? 25;
  const bonus = (depositAmount * percent) / 100;
  if (bonus <= 0) return 0;

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
  return bonus;
}

async function main() {
  await prisma.siteSetting.update({
    where: { id: 1 },
    data: { referralPercent: 25 },
  });
  const settings = await prisma.siteSetting.findUnique({ where: { id: 1 } });
  if (settings.referralPercent !== 25) {
    throw new Error(`Expected 25% setting, got ${settings.referralPercent}`);
  }

  const suffix = Date.now();
  const referrer = await prisma.user.create({
    data: {
      email: `ref-test-${suffix}@test.local`,
      passwordHash: await bcrypt.hash("testpass123", 10),
      referralCode: `T${suffix}`.slice(0, 8).toUpperCase(),
      balance: 100,
    },
  });
  const invitee = await prisma.user.create({
    data: {
      email: `inv-test-${suffix}@test.local`,
      passwordHash: await bcrypt.hash("testpass123", 10),
      referralCode: `I${suffix}`.slice(0, 8).toUpperCase(),
      referredById: referrer.id,
      balance: 0,
    },
  });

  const depositAmount = 100;
  const bonus = await creditReferralBonus(invitee.id, depositAmount);
  if (bonus !== 25) {
    throw new Error(`Expected bonus 25, got ${bonus}`);
  }

  const updated = await prisma.user.findUnique({ where: { id: referrer.id } });
  if (Math.abs(updated.balance - 125) > 0.001) {
    throw new Error(`Expected referrer balance 125, got ${updated.balance}`);
  }

  const tx = await prisma.transaction.findFirst({
    where: { userId: referrer.id, type: "referral" },
    orderBy: { createdAt: "desc" },
  });
  if (!tx || tx.amount !== 25) {
    throw new Error("Referral transaction missing or wrong amount");
  }

  await prisma.transaction.deleteMany({
    where: { userId: { in: [referrer.id, invitee.id] } },
  });
  await prisma.user.deleteMany({
    where: { id: { in: [referrer.id, invitee.id] } },
  });

  console.log("REFERRAL_TEST_OK percent=25 deposit=100 bonus=25");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
