import { prisma } from "@/lib/prisma";
import { ProvidersClient } from "@/components/admin/providers-client";

export const dynamic = "force-dynamic";

export default async function SmmProvidersPage() {
  const providers = await prisma.smmProvider.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { services: true, orders: true } } },
  });
  // strip apiKey for client
  const safe = providers.map((p) => ({
    id: p.id,
    name: p.name,
    apiUrl: p.apiUrl,
    isActive: p.isActive,
    balance: p.balance ? Number(p.balance) : null,
    lastSyncAt: p.lastSyncAt?.toISOString() ?? null,
    services: p._count.services,
    orders: p._count.orders,
  }));
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">SMM Providers</h1>
        <p className="text-sm text-slate-400">Add panel APIs, test connection, import services.</p>
      </div>
      <ProvidersClient initial={safe} />
    </div>
  );
}
