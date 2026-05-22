import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/rbac";
import { genOrderNo } from "@/lib/utils";
import { validateUid } from "@/lib/uid-validator";
import { OrderStatus, PaymentMethod, PaymentStatus, ProductKind, GameCode } from "@prisma/client";

const Body = z.object({
  productId: z.string().min(1),
  uid: z.string().min(1).max(64),
  zoneId: z.string().min(1).max(16).optional(),
  payWithWallet: z.boolean().optional(),
});

export async function POST(req: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
  if (!product || !product.isActive || product.kind !== ProductKind.GAME_TOPUP) {
    return NextResponse.json({ error: "Product not available" }, { status: 404 });
  }
  if (!product.gameCode) {
    return NextResponse.json({ error: "Product missing game code" }, { status: 400 });
  }

  const uidCheck = validateUid({
    gameCode: product.gameCode as GameCode,
    uid: parsed.data.uid,
    zoneId: parsed.data.zoneId,
  });
  if (!uidCheck.ok) return NextResponse.json({ errors: uidCheck.errors }, { status: 422 });

  const totalCost = Number(product.costPrice);
  const totalSell = Number(product.sellPrice);
  const profit = +(totalSell - totalCost).toFixed(2);

  if (parsed.data.payWithWallet && Number(auth.user.walletBalance) < totalSell) {
    return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 402 });
  }

  const order = await prisma.$transaction(async (tx) => {
    const o = await tx.order.create({
      data: {
        orderNo: genOrderNo(),
        userId: auth.user.id,
        productId: product.id,
        quantity: 1,
        unitCost: totalCost,
        unitSell: totalSell,
        totalCost,
        totalSell,
        profit,
        status: parsed.data.payWithWallet ? OrderStatus.PROCESSING : OrderStatus.PENDING,
        paymentStatus: parsed.data.payWithWallet ? PaymentStatus.PAID : PaymentStatus.UNPAID,
        paymentMethod: parsed.data.payWithWallet ? PaymentMethod.WALLET : null,
        gameUid: parsed.data.uid,
        gameZoneId: parsed.data.zoneId,
        gameUsername: uidCheck.username ?? null,
      },
    });

    await tx.uidRecord.create({
      data: {
        orderId: o.id,
        gameCode: product.gameCode as GameCode,
        uid: parsed.data.uid,
        zoneId: parsed.data.zoneId,
        username: uidCheck.username ?? null,
        validatedAt: new Date(),
      },
    });

    if (parsed.data.payWithWallet) {
      await tx.user.update({
        where: { id: auth.user.id },
        data: {
          walletBalance: { decrement: totalSell },
          totalSpent: { increment: totalSell },
        },
      });
      await tx.walletTransaction.create({
        data: {
          userId: auth.user.id,
          amount: -totalSell,
          reason: `Game top-up ${o.orderNo}`,
          meta: { orderId: o.id },
        },
      });
      await tx.payment.create({
        data: {
          orderId: o.id,
          method: PaymentMethod.WALLET,
          amount: totalSell,
          status: PaymentStatus.PAID,
          paidAt: new Date(),
        },
      });
      await tx.revenueLog.create({
        data: {
          orderId: o.id,
          userId: auth.user.id,
          productKind: ProductKind.GAME_TOPUP,
          cost: totalCost,
          sell: totalSell,
          profit,
        },
      });
    }

    return o;
  });

  return NextResponse.json({ order, uid: uidCheck });
}
