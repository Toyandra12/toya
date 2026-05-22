import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";

/**
 * Aggregate financial metrics:
 *  - totals: revenue, cost, profit, refunded
 *  - timeseries: daily for last 30 days
 *  - byKind: revenue split per ProductKind
 */
export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const totalsRaw = await prisma.revenueLog.aggregate({
    _sum: { sell: true, cost: true, profit: true },
  });

  const recent = await prisma.revenueLog.aggregate({
    where: { occurredAt: { gte: since } },
    _sum: { sell: true, profit: true },
  });

  const byKind = await prisma.revenueLog.groupBy({
    by: ["productKind"],
    _sum: { sell: true, cost: true, profit: true },
  });

  // raw sql for daily series (Postgres)
  const series = await prisma.$queryRawUnsafe<{ day: string; sell: number; profit: number }[]>(`
    SELECT
      to_char(date_trunc('day', "occurredAt"), 'YYYY-MM-DD') AS day,
      COALESCE(SUM("sell"), 0)::float AS sell,
      COALESCE(SUM("profit"), 0)::float AS profit
    FROM "RevenueLog"
    WHERE "occurredAt" >= NOW() - INTERVAL '30 days'
    GROUP BY 1
    ORDER BY 1 ASC
  `);

  const ordersAgg = await prisma.order.aggregate({
    _count: true,
    where: { status: { in: ["COMPLETED", "PROCESSING"] } },
  });

  return NextResponse.json({
    totals: {
      revenue: Number(totalsRaw._sum.sell ?? 0),
      cost: Number(totalsRaw._sum.cost ?? 0),
      profit: Number(totalsRaw._sum.profit ?? 0),
      orders: ordersAgg._count,
    },
    last30Days: {
      revenue: Number(recent._sum.sell ?? 0),
      profit: Number(recent._sum.profit ?? 0),
    },
    byKind: byKind.map((b) => ({
      kind: b.productKind,
      revenue: Number(b._sum.sell ?? 0),
      cost: Number(b._sum.cost ?? 0),
      profit: Number(b._sum.profit ?? 0),
    })),
    daily: series,
  });
}
