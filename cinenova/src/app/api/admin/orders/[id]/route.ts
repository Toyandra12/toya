import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";
import { OrderStatus, ProductKind } from "@prisma/client";

const Update = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  notes: z.string().max(2000).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const parsed = Update.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const before = await prisma.order.findUnique({ where: { id } });
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const order = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({ where: { id }, data: parsed.data });

    // refund handling: when status moves to REFUNDED, write a negative revenue log
    if (parsed.data.status === OrderStatus.REFUNDED && before.status !== OrderStatus.REFUNDED) {
      const existing = await tx.revenueLog.findUnique({ where: { orderId: id } });
      if (existing) {
        await tx.revenueLog.update({
          where: { orderId: id },
          data: {
            cost: existing.cost,
            sell: 0,
            profit: -Number(existing.cost),
          },
        });
      } else {
        await tx.revenueLog.create({
          data: {
            orderId: id,
            userId: before.userId,
            productKind: ProductKind.DIGITAL,
            cost: before.totalCost,
            sell: 0,
            profit: -Number(before.totalCost),
          },
        });
      }
    }
    return updated;
  });

  await prisma.activityLog.create({
    data: { actorId: auth.user.id, actorRole: auth.user.role, action: "order.update", target: id, meta: parsed.data },
  });
  return NextResponse.json({ order });
}
