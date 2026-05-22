import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { money } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");
  const txns = await prisma.walletTransaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="panel p-5 md:col-span-2">
          <div className="label">Profile</div>
          <div className="mt-2 space-y-1">
            <div className="text-lg font-semibold">{user.name}</div>
            <div className="text-sm text-slate-400">{user.email}</div>
            {user.phone && <div className="text-sm text-slate-500">{user.phone}</div>}
          </div>
        </div>
        <div className="panel p-5">
          <div className="label">Wallet</div>
          <div className="mt-2 text-2xl font-semibold">{money(Number(user.walletBalance))}</div>
          <p className="text-xs text-slate-500 mt-1">Spent: {money(Number(user.totalSpent))}</p>
          <Link href="/orders" className="btn-ghost mt-4 inline-flex">
            View orders
          </Link>
        </div>
      </div>
      <div className="panel overflow-hidden">
        <div className="px-4 py-3 border-b border-bg-border">
          <h2 className="font-semibold">Wallet activity</h2>
        </div>
        <table className="w-full text-sm">
          <tbody>
            {txns.map((t) => (
              <tr key={t.id} className="border-t border-bg-border">
                <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                  {new Date(t.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3">{t.reason}</td>
                <td className={`px-4 py-3 text-right font-mono ${Number(t.amount) >= 0 ? "text-success" : "text-danger"}`}>
                  {money(Number(t.amount))}
                </td>
              </tr>
            ))}
            {txns.length === 0 && (
              <tr>
                <td className="px-4 py-10 text-center text-slate-500" colSpan={3}>
                  No wallet activity yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
