import { prisma } from "@/lib/prisma";
import { ServicesClient } from "@/components/admin/services-client";

export const dynamic = "force-dynamic";

export default async function SmmServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ providerId?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const [services, providers] = await Promise.all([
    prisma.smmService.findMany({
      where: {
        providerId: sp.providerId,
        OR: sp.q
          ? [
              { name: { contains: sp.q, mode: "insensitive" } },
              { category: { contains: sp.q, mode: "insensitive" } },
              { vendorServiceId: { contains: sp.q } },
            ]
          : undefined,
      },
      include: { provider: { select: { id: true, name: true } } },
      orderBy: [{ category: "asc" }, { name: "asc" }],
      take: 200,
    }),
    prisma.smmProvider.findMany({ select: { id: true, name: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">SMM Services</h1>
        <p className="text-sm text-slate-400">Edit price, toggle availability, remove unwanted services.</p>
      </div>
      <ServicesClient
        providers={providers}
        services={services.map((s) => ({
          id: s.id,
          name: s.name,
          category: s.category,
          providerName: s.provider.name,
          vendorServiceId: s.vendorServiceId,
          vendorRate: Number(s.vendorRate),
          sellRate: Number(s.sellRate),
          minQty: s.minQty,
          maxQty: s.maxQty,
          isActive: s.isActive,
        }))}
        currentProviderId={sp.providerId ?? ""}
        currentQ={sp.q ?? ""}
      />
    </div>
  );
}
