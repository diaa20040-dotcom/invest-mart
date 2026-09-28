import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/admin";

export async function GET() {
  const user = await getCurrentUser();
  if (!canAccessAdmin(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const deposits = await prisma.deposit.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true, name: true } },
    },
  });

  return NextResponse.json(
    deposits.map((d) => ({
      id: d.id,
      amount: d.amount,
      note: d.note,
      createdAt: d.createdAt,
      userEmail: d.user.email,
      userName: d.user.name,
      network: d.network,
      senderAddress: d.senderAddress,
    }))
  );
}
