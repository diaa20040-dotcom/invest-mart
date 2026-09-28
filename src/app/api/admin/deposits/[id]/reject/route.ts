import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/admin";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!canAccessAdmin(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const deposit = await prisma.deposit.findUnique({ where: { id } });
  if (!deposit || deposit.status !== "pending") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.deposit.update({
    where: { id },
    data: { status: "rejected" },
  });

  return NextResponse.json({ ok: true });
}
