/**
 * Public-facing SMM order placement.
 * Creates a local Order + SmmOrder, then forwards to vendor.
 * Wallet is the default payment method here; payment gateway integration is
 * handled separately for non-wallet flows.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/rbac";
import { genOrderNo } from "@/lib/utils";
import { forwardOrder } from "@/lib/smm-engine";
import { OrderStatus, PaymentMethod, PaymentStatus, ProductKind, SmmOrderStatus } from "@prisma/client";

const Body = z.object({
  serviceId: z.string().min(1), // local SmmService.id
  link: z.string().url(),
  quantity: z.number().int().positive(),
  payWithWallet: z.boolean().optional(),
});

export async function POST(req: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { serviceId, link, quantity, payWithWallet } = parsed.data;
  const service = await prisma.smmService.findUnique({
    where: { id: serviceId },
    include: { provider: true },
  });
  if (!service || !service.isActive) return NextResponse.json({ error: "Service unavailable" }, { status: 404 });
  if (!service.provider.isActive) return NextResponse.json({ error: "Provider disabled" }, { status: 400 });
  if (quantity < service.minQty || quantity > service.maxQty) {
    return NextResponse.json(
      { error: `Quantity must be between ${service.minQty} and ${service.maxQty}` },
      { status: 400 },
    );
  }

  const totalCost = +(Number(service.vendorRate) * (quantity / 1000)).toFixed(2);
  const totalSell = +(Number(service.sellRate) * (quantity / 1000)).toFixed(2);
  const profit = +(totalSell - totalCost).toFixed(2);

  // ensure backing Product row exists for this service (auto-create on first sale)
  let product = await prisma.product.findUnique({ where: { smmServiceId: service.id } });
  if (!product) {
    let smmCat = await prisma.category.findUnique({ where: { slug: "smm" } });
    if (!smmCat) {
      smmCat = await prisma.category.create({
        data: { slug: "smm", name: "SMM Services", kind: ProductKind.SMM_SERVICE },
      });
    }
    product = await prisma.product.create({
      data: {
        sku: `SMM-${service.id}`,
        kind: ProductKind.SMM_SERVICE,
        categoryId: smmCat.id,
        name: service.name,
        smmServiceId: service.id,
        costPrice: service.vendorRate,
        sellPrice: service.sellRate,
      },
    });
  }

  // wallet check
  if (payWithWallet) {
    if (Number(auth.user.walletBalance) < totalSell) {
      return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 402 });
    }
  }

  const order = await prisma.$transaction(async (tx) => {
    const localSmm = await tx.smmOrder.create({
      data: {
        providerId: service.providerId,
        serviceId: service.id,
        link,
        quantity,
        status: SmmOrderStatus.PENDING,
      },
    });

    const o = await tx.order.create({
      data: {
        orderNo: genOrderNo(),
        userId: auth.user.id,
        productId: product!.id,
        quantity: 1,
        unitCost: totalCost,
        unitSell: totalSell,
        totalCost,
        totalSell,
        profit,
        status: OrderStatus.PROCESSING,
        paymentStatus: payWithWallet ? PaymentStatus.PAID : PaymentStatus.UNPAID,
        paymentMethod: payWithWallet ? PaymentMethod.WALLET : null,
        smmOrderId: localSmm.id,
        smmTarget: link,
      },
    });

    if (payWithWallet) {
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
          reason: `SMM order ${o.orderNo}`,
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
          productKind: ProductKind.SMM_SERVICE,
          cost: totalCost,
          sell: totalSell,
          profit,
        },
      });
    }
    return o;
  });

  // forward to vendor only if paid
  if (payWithWallet) {
    try {
      await forwardOrder(order.smmOrderId!);
    } catch (e) {
      // record but don't fail user response — admin can retry
      await prisma.activityLog.create({
        data: { action: "smm.forward.error", target: order.id, meta: { error: (e as Error).message } },
      });
    }
  }

  return NextResponse.json({ order });
}
