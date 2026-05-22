import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SmmOrderClient } from "@/components/storefront/smm-order-client";

export const dynamic = "force-dynamic";

export default async function SmmServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await prisma.smmService.findUnique({
    where: { id },
    include: { provider: true },
  });
  if (!s || !s.isActive || !s.provider.isActive) notFound();

  return (
    <SmmOrderClient
      service={{
        id: s.id,
        name: s.name,
        category: s.category,
        minQty: s.minQty,
        maxQty: s.maxQty,
        sellRate: Number(s.sellRate),
      }}
    />
  );
}
