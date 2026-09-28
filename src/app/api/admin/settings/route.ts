import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/admin";

export async function GET() {
  const user = await getCurrentUser();
  if (!canAccessAdmin(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const settings = await prisma.siteSetting.findUnique({ where: { id: 1 } });
  return NextResponse.json(settings);
}

const schema = z.object({
  depositWallet: z.string().min(3).optional(),
  depositWalletBep20: z.string().min(10),
  depositWalletTrc20: z.string().min(10),
  withdrawWallet: z.string().min(3),
  referralPercent: z.number().min(0).max(100),
  supportTelegramUrl: z.string().max(500).optional(),
});

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!canAccessAdmin(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }
  const data = parsed.data;
  const settings = await prisma.siteSetting.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      depositWallet: data.depositWalletTrc20,
      ...data,
    },
    update: {
      ...data,
      depositWallet: data.depositWalletTrc20,
    },
  });
  return NextResponse.json(settings);
}
