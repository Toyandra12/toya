import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SmmPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string }>;
}) {
  const sp = await searchParams;
  const services = await prisma.smmService.findMany({
    where: {
      isActive: true,
      provider: { isActive: true },
      category: sp.cat ?? undefined,
      OR: sp.q
        ? [
            { name: { contains: sp.q, mode: "insensitive" } },
            { category: { contains: sp.q, mode: "insensitive" } },
          ]
        : undefined,
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
    take: 200,
  });

  const cats = Array.from(new Set(services.map((s) => s.category).filter(Boolean) as string[]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">SMM Marketplace</h1>
        <p className="text-slate-400">Followers, views, likes — fulfilled automatically.</p>
      </div>
      <form className="flex gap-2 flex-wrap">
        <input name="q" defaultValue={sp.q ?? ""} placeholder="Search services…" className="input max-w-md" />
        <select name="cat" defaultValue={sp.cat ?? ""} className="input max-w-[260px]">
          <option value="">All categories</option>
          {cats.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button className="btn-primary">Filter</button>
      </form>
      {services.length === 0 ? (
        <div className="panel p-10 text-center text-slate-400">
          No SMM services available yet. Admin must add a provider and import services first.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {services.map((s) => (
            <Link
              key={s.id}
              href={`/smm/${s.id}`}
              className="panel p-5 hover:border-brand-500/40 hover:shadow-glow transition"
            >
              <div className="text-xs text-slate-400">{s.category ?? "General"}</div>
              <div className="font-semibold mt-1 line-clamp-2">{s.name}</div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <div>
                  Min {s.minQty} · Max {s.maxQty.toLocaleString()}
                </div>
                <div className="text-brand-400 font-mono">{Number(s.sellRate).toFixed(2)} / 1k</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
