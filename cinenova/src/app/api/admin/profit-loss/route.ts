import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";

/**
 * Profit/loss split: totals + month-over-month series.
 */
export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const totals = await prisma.revenueLog.aggregate({
    _sum: { profit: true },
  });

  const profits = await prisma.revenueLog.aggregate({
    where: { profit: { gt: 0 } },
    _sum: { profit: true },
  });
  const losses = await prisma.revenueLog.aggregate({
    where: { profit: { lt: 0 } },
    _sum: { profit: true },
  });

  const monthly = await prisma.$queryRawUnsafe<{ month: string; profit: number; loss: number }[]>(`
    SELECT
      to_char(date_trunc('month', "occurredAt"), 'YYYY-MM') AS month,
      COALESCE(SUM(CASE WHEN "profit" > 0 THEN "profit" ELSE 0 END), 0)::float AS profit,
      COALESCE(SUM(CASE WHEN "profit" < 0 THEN "profit" ELSE 0 END), 0)::float AS loss
    FROM "RevenueLog"
    WHERE "occurredAt" >= NOW() - INTERVAL '12 months'
    GROUP BY 1
    ORDER BY 1 ASC
  `);

  return NextResponse.json({
    netProfit: Number(totals._sum.profit ?? 0),
    grossProfit: Number(profits._sum.profit ?? 0),
    grossLoss: Number(losses._sum.profit ?? 0),
    monthly,
  });
}
