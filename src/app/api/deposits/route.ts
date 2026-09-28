import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import {
  type DepositNetwork,
  isValidSenderAddress,
} from "@/lib/deposit-networks";

const schema = z.object({
  amount: z.number().positive(),
  network: z.enum(["bep20", "trc20"]),
  senderAddress: z.string().min(10).max(120),
  note: z.string().optional(),
});

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const network = parsed.data.network as DepositNetwork;
  const sender = parsed.data.senderAddress.trim();
  if (!isValidSenderAddress(network, sender)) {
    return NextResponse.json({ error: "invalid_sender" }, { status: 400 });
  }

  const deposit = await prisma.deposit.create({
    data: {
      userId,
      amount: parsed.data.amount,
      network,
      senderAddress: sender,
      note: parsed.data.note,
      status: "pending",
    },
  });

  return NextResponse.json({ ok: true, id: deposit.id });
}
