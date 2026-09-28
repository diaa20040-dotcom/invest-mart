import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/admin";

export async function GET() {
  const user = await getCurrentUser();
  if (!canAccessAdmin(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const withdrawals = await prisma.withdrawal.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true, name: true } },
    },
  });

  return NextResponse.json(
    withdrawals.map((w) => ({
      id: w.id,
      amount: w.amount,
      network: w.network,
      walletAddress: w.walletAddress,
      createdAt: w.createdAt,
      userEmail: w.user.email,
      userName: w.user.name,
    }))
  );
}
