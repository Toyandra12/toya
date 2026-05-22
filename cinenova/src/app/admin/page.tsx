import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/stat-card";
import { RevenueArea, MonthlyPLChart } from "@/components/admin/revenue-charts";
import { money, fmtNumber } from "@/lib/utils";
import { CircleDollarSign, TrendingUp, ShoppingCart, Users } from "lucide-react";

export const dynamic = "force-dynamic";

async function getRevenue() {
  const totalsRaw = await prisma.revenueLog.aggregate({
    _sum: { sell: true, cost: true, profit: true },
  });
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const recent = await prisma.revenueLog.aggregate({
    where: { occurredAt: { gte: since } },
    _sum: { sell: true, profit: true },
  });
  const orders = await prisma.order.count();
  const customers = await prisma.user.count({ where: { role: "USER" } });

  const series = await prisma.$queryRawUnsafe<{ day: string; sell: number; profit: number }[]>(`
    SELECT
      to_char(date_trunc('day', "occurredAt"), 'YYYY-MM-DD') AS day,
      COALESCE(SUM("sell"), 0)::float AS sell,
      COALESCE(SUM("profit"), 0)::float AS profit
    FROM "RevenueLog"
    WHERE "occurredAt" >= NOW() - INTERVAL '30 days'
    GROUP BY 1 ORDER BY 1 ASC
  `);

  const monthly = await prisma.$queryRawUnsafe<{ month: string; profit: number; loss: number }[]>(`
    SELECT
      to_char(date_trunc('month', "occurredAt"), 'YYYY-MM') AS month,
      COALESCE(SUM(CASE WHEN "profit" > 0 THEN "profit" ELSE 0 END), 0)::float AS profit,
      COALESCE(SUM(CASE WHEN "profit" < 0 THEN "profit" ELSE 0 END), 0)::float AS loss
    FROM "RevenueLog"
    WHERE "occurredAt" >= NOW() - INTERVAL '12 months'
    GROUP BY 1 ORDER BY 1 ASC
  `);

  return {
    totalRevenue: Number(totalsRaw._sum.sell ?? 0),
    totalCost: Number(totalsRaw._sum.cost ?? 0),
    totalProfit: Number(totalsRaw._sum.profit ?? 0),
    recent30Revenue: Number(recent._sum.sell ?? 0),
    recent30Profit: Number(recent._sum.profit ?? 0),
    orders,
    customers,
    series,
    monthly,
  };
}

export default async function AdminOverviewPage() {
  const r = await getRevenue();
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="text-sm text-slate-400">Revenue, profit/loss and growth at a glance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={money(r.totalRevenue)}
          hint={`Last 30d: ${money(r.recent30Revenue)}`}
          icon={<CircleDollarSign className="h-4 w-4" />}
        />
        <StatCard
          label="Net Profit"
          value={money(r.totalProfit)}
          hint={`Last 30d: ${money(r.recent30Profit)}`}
          trend={r.totalProfit >= 0 ? "up" : "down"}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard label="Orders" value={fmtNumber(r.orders)} icon={<ShoppingCart className="h-4 w-4" />} />
        <StatCard label="Customers" value={fmtNumber(r.customers)} icon={<Users className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="panel p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Revenue & profit · last 30 days</h2>
          </div>
          {r.series.length ? (
            <RevenueArea data={r.series} />
          ) : (
            <EmptyState text="No revenue logged yet. It populates automatically as paid orders complete." />
          )}
        </div>
        <div className="panel p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Monthly profit / loss</h2>
          </div>
          {r.monthly.length ? (
            <MonthlyPLChart data={r.monthly} />
          ) : (
            <EmptyState text="No monthly data yet." />
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="h-72 flex items-center justify-center text-slate-500 text-sm border border-dashed border-bg-border rounded-xl">
      {text}
    </div>
  );
}
