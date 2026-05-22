import { prisma } from "@/lib/prisma";
import { money } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; kind?: string }>;
}) {
  const sp = await searchParams;
  const orders = await prisma.order.findMany({
    where: {
      status: (sp.status as never) || undefined,
      product: sp.kind ? ({ kind: sp.kind } as never) : undefined,
      OR: sp.q
        ? [
            { orderNo: { contains: sp.q, mode: "insensitive" } },
            { user: { email: { contains: sp.q, mode: "insensitive" } } },
            { gameUid: { contains: sp.q } },
          ]
        : undefined,
    },
    include: {
      user: { select: { email: true, name: true } },
      product: { select: { name: true, kind: true, gameCode: true } },
      smmOrder: true,
      uidRecord: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Orders</h1>
        <p className="text-sm text-slate-400">All orders across SMM, game top-ups, subscriptions.</p>
      </div>

      <form className="flex flex-wrap gap-2 items-center">
        <input
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="Search order #, email, UID, link…"
          className="input max-w-sm"
        />
        <select name="status" defaultValue={sp.status ?? ""} className="input max-w-[180px]">
          <option value="">All statuses</option>
          {["PENDING", "PROCESSING", "COMPLETED", "FAILED", "REFUNDED", "CANCELLED"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select name="kind" defaultValue={sp.kind ?? ""} className="input max-w-[180px]">
          <option value="">All kinds</option>
          {["GAME_TOPUP", "SMM_SERVICE", "SUBSCRIPTION", "DIGITAL"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button className="btn-primary">Filter</button>
      </form>

      <div className="panel overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg-subtle text-slate-400">
            <tr>
              <Th>Order</Th>
              <Th>Customer</Th>
              <Th>Product</Th>
              <Th>Target</Th>
              <Th>Sell</Th>
              <Th>Profit</Th>
              <Th>Status</Th>
              <Th>Pay</Th>
              <Th>Created</Th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-bg-border hover:bg-bg-subtle/50">
                <Td>
                  <Link href={`/admin/orders/${o.id}`} className="text-brand-400">
                    {o.orderNo}
                  </Link>
                </Td>
                <Td>
                  <div className="font-medium">{o.user.name}</div>
                  <div className="text-xs text-slate-400">{o.user.email}</div>
                </Td>
                <Td>
                  <div>{o.product.name}</div>
                  <div className="text-xs text-slate-400">{o.product.kind}</div>
                </Td>
                <Td className="font-mono text-xs">
                  {o.gameUid ? `${o.gameUid}${o.gameZoneId ? ` (${o.gameZoneId})` : ""}` : o.smmTarget ?? "—"}
                </Td>
                <Td>{money(Number(o.totalSell))}</Td>
                <Td className={Number(o.profit) >= 0 ? "text-success" : "text-danger"}>
                  {money(Number(o.profit))}
                </Td>
                <Td>
                  <StatusPill status={o.status} />
                </Td>
                <Td>
                  <PayPill status={o.paymentStatus} />
                </Td>
                <Td className="text-xs text-slate-400">{new Date(o.createdAt).toLocaleString()}</Td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <Td colSpan={9}>
                  <div className="text-center py-10 text-slate-500">No orders match.</div>
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
function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    COMPLETED: "pill-success",
    PROCESSING: "pill-info",
    PENDING: "pill-warn",
    FAILED: "pill-danger",
    REFUNDED: "pill-muted",
    CANCELLED: "pill-muted",
  };
  return <span className={map[status] ?? "pill-muted"}>{status}</span>;
}
function PayPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    PAID: "pill-success",
    UNPAID: "pill-warn",
    REFUNDED: "pill-muted",
    FAILED: "pill-danger",
  };
  return <span className={map[status] ?? "pill-muted"}>{status}</span>;
}
