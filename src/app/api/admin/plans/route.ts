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
  const plans = await prisma.plan.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(plans);
}

const planSchema = z.object({
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  priceUsd: z.number().nonnegative(),
  dailyProfitUsd: z.number().nonnegative(),
  active: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!canAccessAdmin(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = planSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }
  const plan = await prisma.plan.create({ data: parsed.data });
  return NextResponse.json(plan);
}
