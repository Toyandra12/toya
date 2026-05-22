import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { money } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/orders");

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: {
      product: { select: { name: true, kind: true, gameCode: true } },
      smmOrder: true,
      uidRecord: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Your orders</h1>
      {sp.ok && (
        <div className="panel p-4 border-success/30 bg-success/10 text-success text-sm">
          Order <span className="font-mono">{sp.ok}</span> placed successfully.
        </div>
      )}
      <div className="panel overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg-subtle text-slate-400">
            <tr>
              <Th>Order</Th>
              <Th>Product</Th>
              <Th>Target</Th>
              <Th>Total</Th>
              <Th>Status</Th>
              <Th>When</Th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-bg-border">
                <Td className="font-mono text-xs">{o.orderNo}</Td>
                <Td>
                  <div>{o.product.name}</div>
                  <div className="text-xs text-slate-500">{o.product.kind}</div>
                </Td>
                <Td className="text-xs font-mono">
                  {o.gameUid ? `${o.gameUid}${o.gameZoneId ? ` (${o.gameZoneId})` : ""}` : o.smmTarget ?? "—"}
                </Td>
                <Td>{money(Number(o.totalSell), o.currency)}</Td>
                <Td>
                  <span
                    className={
                      o.status === "COMPLETED"
                        ? "pill-success"
                        : o.status === "FAILED"
                        ? "pill-danger"
                        : o.status === "PROCESSING"
                        ? "pill-info"
                        : "pill-warn"
                    }
                  >
                    {o.status}
                  </span>
                </Td>
                <Td className="text-xs text-slate-400">{new Date(o.createdAt).toLocaleString()}</Td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <Td colSpan={6}>
                  <div className="text-center py-10 text-slate-500">No orders yet.</div>
                </Td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left px-4 py-3 font-medium uppercase tracking-wide text-xs">{children}</th>;
}
function Td({ children, className = "", colSpan }: { children: React.ReactNode; className?: string; colSpan?: number }) {
  return (
    <td colSpan={colSpan} className={`px-4 py-3 align-top ${className}`}>
      {children}
    </td>
  );
}
