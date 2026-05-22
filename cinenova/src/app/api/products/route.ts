import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProductKind } from "@prisma/client";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const kind = url.searchParams.get("kind") as ProductKind | null;
  const gameCode = url.searchParams.get("gameCode") ?? undefined;
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      kind: kind ?? undefined,
      gameCode: gameCode ? (gameCode as never) : undefined,
    },
    orderBy: [{ kind: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      sku: true,
      kind: true,
      gameCode: true,
      topupAmount: true,
      sellPrice: true,
      currency: true,
      imageUrl: true,
    },
  });
  return NextResponse.json({ products });
}
