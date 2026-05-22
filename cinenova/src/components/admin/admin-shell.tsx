"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Plug,
  ListChecks,
  ScrollText,
  LogOut,
  Sparkles,
} from "lucide-react";

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/smm/providers", label: "SMM Providers", icon: Plug },
  { href: "/admin/smm/services", label: "SMM Services", icon: ListChecks },
  { href: "/admin/smm/logs", label: "SMM API Logs", icon: ScrollText },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="min-h-screen grid grid-cols-[260px_1fr]">
      <aside className="border-r border-bg-border bg-bg-subtle">
        <div className="h-14 flex items-center gap-2 px-5 border-b border-bg-border">
          <Sparkles className="h-5 w-5 text-brand-400" />
          <div className="font-semibold">CineNova Admin</div>
        </div>
        <nav className="p-3 space-y-1">
          {nav.map((n) => {
            const Active = path === n.href || (n.href !== "/admin" && path.startsWith(n.href));
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition",
                  Active
                    ? "bg-brand-500/15 text-brand-400 border border-brand-500/25"
                    : "text-slate-300 hover:bg-bg-elevated",
                )}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-bg-border absolute bottom-0 w-[260px]">
          <form action="/api/auth/logout" method="post">
            <button className="btn-ghost w-full justify-start">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="p-6">{children}</main>
    </div>
  );
}
