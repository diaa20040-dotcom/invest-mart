import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/admin";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentUser();
  if (!canAccessAdmin(admin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const w = await prisma.withdrawal.findUnique({ where: { id } });
  if (!w || w.status !== "pending") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.withdrawal.update({
      where: { id },
      data: { status: "rejected" },
    });
    await tx.user.update({
      where: { id: w.userId },
      data: { balance: { increment: w.amount } },
    });
    await tx.transaction.create({
      data: {
        userId: w.userId,
        type: "withdrawal_refund",
        amount: w.amount,
        meta: JSON.stringify({ withdrawalId: id }),
      },
    });
  });

  return NextResponse.json({ ok: true });
}
