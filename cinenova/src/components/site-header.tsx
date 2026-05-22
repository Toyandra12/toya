import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { Sparkles, ShoppingBag, User as UserIcon, ShieldCheck } from "lucide-react";

export default async function SiteHeader() {
  const user = await getCurrentUser();
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";
  return (
    <header className="border-b border-bg-border bg-bg-subtle/80 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Sparkles className="h-5 w-5 text-brand-400" />
          <span className="text-slate-100">CineNova</span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link href="/games" className="btn-ghost">
            <ShoppingBag className="h-4 w-4" /> Games
          </Link>
          <Link href="/smm" className="btn-ghost">
            SMM
          </Link>
          {isAdmin && (
            <Link href="/admin" className="btn-ghost">
              <ShieldCheck className="h-4 w-4" /> Admin
            </Link>
          )}
          {user ? (
            <Link href="/account" className="btn-primary">
              <UserIcon className="h-4 w-4" /> {user.name.split(" ")[0]}
            </Link>
          ) : (
            <Link href="/login" className="btn-primary">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
