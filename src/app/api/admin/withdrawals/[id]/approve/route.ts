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
  const w = await prisma.withdrawal.findUnique({ where: { id } });
  if (!w || w.status !== "pending") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await prisma.withdrawal.update({
    where: { id },
    data: { status: "approved" },
  });
  return NextResponse.json({ ok: true });
}
