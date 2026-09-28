import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const OWNER_ADMIN_EMAIL = "ediaa158@gmail.com";
const OWNER_ADMIN_PASSWORD = "123Diaa456";

async function main() {
  await prisma.siteSetting.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      depositWallet: "YOUR_DEPOSIT_WALLET_ADDRESS",
      withdrawWallet: "YOUR_PAYOUT_WALLET_ADDRESS",
      referralPercent: 10,
    },
    update: {},
  });

  const plans = [
    {
      nameEn: "Free Trial",
      nameAr: "الخطة المجانية",
      priceUsd: 1,
      dailyProfitUsd: 0.5,
      sortOrder: 0,
    },
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

  const hash = await bcrypt.hash(OWNER_ADMIN_PASSWORD, 10);
  await prisma.user.upsert({
    where: { email: OWNER_ADMIN_EMAIL },
    create: {
      email: OWNER_ADMIN_EMAIL,
      passwordHash: hash,
      name: "Admin",
      referralCode: "OWNER01",
      isAdmin: true,
      balance: 999_999_999_999,
    },
    update: {
      isAdmin: true,
      passwordHash: hash,
      balance: 999_999_999_999,
    },
  });

  await prisma.user.updateMany({
    where: {
      email: { not: OWNER_ADMIN_EMAIL },
    },
    data: { isAdmin: false },
  });

  console.log(`Seed OK — owner admin: ${OWNER_ADMIN_EMAIL}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
