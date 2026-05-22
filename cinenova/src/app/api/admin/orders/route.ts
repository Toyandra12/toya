import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";
import { OrderStatus, ProductKind } from "@prisma/client";

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const url = new URL(req.url);
  const status = url.searchParams.get("status") as OrderStatus | null;
  const kind = url.searchParams.get("kind") as ProductKind | null;
  const q = url.searchParams.get("q") ?? undefined;
  const take = Math.min(Number(url.searchParams.get("take") ?? 50), 200);
  const skip = Number(url.searchParams.get("skip") ?? 0);

  const orders = await prisma.order.findMany({
    where: {
      status: status ?? undefined,
      product: kind ? { kind } : undefined,
      OR: q
        ? [
            { orderNo: { contains: q, mode: "insensitive" } },
            { user: { email: { contains: q, mode: "insensitive" } } },
            { gameUid: { contains: q } },
            { smmTarget: { contains: q, mode: "insensitive" } },
          ]
        : undefined,
    },
    include: {
      user: { select: { id: true, email: true, name: true } },
      product: { select: { id: true, name: true, kind: true, gameCode: true } },
      smmOrder: true,
      uidRecord: true,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
    take,
    skip,
  });
  const total = await prisma.order.count();
  return NextResponse.json({ orders, total });
}
