import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { money } from "@/lib/utils";

export const dynamic = "force-dynamic";

const GAME_LABELS: Record<string, string> = {
  FREE_FIRE: "Free Fire",
  PUBG: "PUBG Mobile",
  MOBILE_LEGENDS: "Mobile Legends",
  VALORANT: "Valorant",
};

export default async function GamesPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true, kind: "GAME_TOPUP" },
    orderBy: [{ gameCode: "asc" }, { sellPrice: "asc" }],
  });
  const grouped = products.reduce<Record<string, typeof products>>((acc, p) => {
    const key = p.gameCode ?? "OTHER";
    (acc[key] ||= []).push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-semibold">Game Top-Ups</h1>
        <p className="text-slate-400">Pick a package, enter your UID, get diamonds.</p>
      </div>

      {Object.keys(grouped).length === 0 && (
        <div className="panel p-10 text-center text-slate-400">
          No products yet. Run <code className="text-brand-400">npm run prisma:seed</code> first.
        </div>
      )}

      {Object.entries(grouped).map(([code, items]) => (
        <section key={code} className="space-y-3">
          <h2 className="text-xl font-semibold">{GAME_LABELS[code] ?? code}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {items.map((p) => (
              <Link
                key={p.id}
                href={`/games/${p.id}`}
                className="panel p-5 hover:border-brand-500/40 hover:shadow-glow transition"
              >
                <div className="text-sm text-slate-400">{p.topupAmount}</div>
                <div className="text-lg font-semibold mt-1">{p.name}</div>
                <div className="text-brand-400 font-mono mt-2">{money(Number(p.sellPrice), p.currency)}</div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
