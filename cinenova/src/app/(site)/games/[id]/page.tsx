import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { GameTopupClient } from "@/components/storefront/game-topup-client";

export const dynamic = "force-dynamic";

export default async function GameProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product || product.kind !== "GAME_TOPUP" || !product.isActive) notFound();

  return (
    <GameTopupClient
      product={{
        id: product.id,
        name: product.name,
        topupAmount: product.topupAmount,
        sellPrice: Number(product.sellPrice),
        currency: product.currency,
        gameCode: product.gameCode!,
      }}
    />
  );
}
