import { prisma } from "@/lib/prisma";
import { money } from "@/lib/utils";
import { BlockToggle } from "@/components/admin/block-toggle";

export const dynamic = "force-dynamic";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q } },
            { name: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { _count: { select: { orders: true } } },
  });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Customers</h1>
        <p className="text-sm text-slate-400">Search, block/unblock, and review spend per user.</p>
      </div>
      <form className="flex gap-2">
        <input name="q" defaultValue={q ?? ""} placeholder="Search by name, email, phone" className="input max-w-md" />
        <button className="btn-primary">Search</button>
      </form>
      <div className="panel overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg-subtle text-slate-400">
            <tr>
              <Th>Customer</Th>
              <Th>Status</Th>
              <Th>Wallet</Th>
              <Th>Total Spent</Th>
              <Th>Orders</Th>
              <Th>Joined</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-bg-border">
                <Td>
                  <div className="font-medium">{u.name}</div>
                  <div className="text-xs text-slate-400">{u.email}</div>
                  {u.phone && <div className="text-xs text-slate-500">{u.phone}</div>}
                </Td>
                <Td>
                  <span className={u.status === "ACTIVE" ? "pill-success" : "pill-danger"}>{u.status}</span>
                </Td>
                <Td>{money(Number(u.walletBalance))}</Td>
                <Td>{money(Number(u.totalSpent))}</Td>
                <Td>{u._count.orders}</Td>
                <Td className="text-xs text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</Td>
                <Td>
                  <BlockToggle userId={u.id} blocked={u.status === "BLOCKED"} />
                </Td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <Td colSpan={7}>
                  <div className="text-center py-10 text-slate-500">No customers.</div>
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
