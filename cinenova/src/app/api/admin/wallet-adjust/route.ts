import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";

const Body = z.object({
  userId: z.string().min(1),
  amount: z.number(), // positive credits, negative debits
  reason: z.string().min(2).max(200),
});

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const updated = await prisma.$transaction(async (tx) => {
    const u = await tx.user.update({
      where: { id: parsed.data.userId },
      data: { walletBalance: { increment: parsed.data.amount } },
    });
    await tx.walletTransaction.create({
      data: {
        userId: parsed.data.userId,
        amount: parsed.data.amount,
        reason: `[admin] ${parsed.data.reason}`,
        meta: { adminId: auth.user.id },
      },
    });
    return u;
  });

  await prisma.activityLog.create({
    data: {
      actorId: auth.user.id,
      actorRole: auth.user.role,
      action: "user.wallet.adjust",
      target: parsed.data.userId,
      meta: { amount: parsed.data.amount, reason: parsed.data.reason },
    },
  });
  return NextResponse.json({ walletBalance: updated.walletBalance });
}
