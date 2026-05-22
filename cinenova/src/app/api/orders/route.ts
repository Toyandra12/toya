import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/rbac";

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const orders = await prisma.order.findMany({
    where: { userId: auth.user.id },
    include: {
      product: { select: { name: true, kind: true, gameCode: true } },
      smmOrder: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ orders });
}
