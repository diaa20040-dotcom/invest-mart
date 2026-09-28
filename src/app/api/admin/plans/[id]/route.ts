import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/admin";

const planSchema = z.object({
  nameEn: z.string().min(1).optional(),
  nameAr: z.string().min(1).optional(),
  priceUsd: z.number().nonnegative().optional(),
  dailyProfitUsd: z.number().nonnegative().optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!canAccessAdmin(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const parsed = planSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }
  const plan = await prisma.plan.update({ where: { id }, data: parsed.data });
  return NextResponse.json(plan);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!canAccessAdmin(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const subs = await prisma.userPlan.count({ where: { planId: id } });
  if (subs > 0) {
    await prisma.plan.update({
      where: { id },
      data: { active: false },
    });
    return NextResponse.json({
      ok: true,
      deactivated: true,
      message: "Plan has active subscriptions; marked inactive instead of deleted.",
    });
  }
  await prisma.plan.delete({ where: { id } });
  return NextResponse.json({ ok: true, deactivated: false });
}
