import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.siteSetting.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      depositWallet: "TXyzDemoDepositWalletReplaceInAdmin",
      withdrawWallet: "TXyzDemoPayoutWalletReplaceInAdmin",
      referralPercent: 10,
    },
    update: {},
  });

  const plans = [
    {
      nameEn: "Starter Shop",
      nameAr: "محل البداية",
      priceUsd: 9,
      dailyProfitUsd: 3,
      sortOrder: 1,
    },
    {
      nameEn: "Growth Market",
      nameAr: "سوق النمو",
      priceUsd: 50,
      dailyProfitUsd: 12,
      sortOrder: 2,
    },
  ];

  for (const p of plans) {
    const existing = await prisma.plan.findFirst({
      where: { nameEn: p.nameEn },
    });
    if (!existing) {
      await prisma.plan.create({ data: p });
    }
  }

  const adminEmail = "admin@invest.local";
  const hash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      passwordHash: hash,
      name: "Admin",
      referralCode: "ADMIN01",
      isAdmin: true,
      balance: 0,
    },
    update: { isAdmin: true },
  });

  console.log("Seed OK — admin: admin@invest.local / admin123");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
