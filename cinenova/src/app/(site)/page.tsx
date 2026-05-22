import Link from "next/link";
import { Gamepad2, Megaphone, Package, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl border border-bg-border bg-gradient-to-br from-brand-600/20 via-brand-accent/10 to-transparent p-10">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-brand-500/15 text-brand-400 border border-brand-500/30">
            New · SMM automation engine + UID-based game top-ups
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
            One platform. <span className="text-brand-400">Every digital good.</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Game diamonds, SMM orders, subscriptions — fulfilled instantly with profit/loss tracking baked in.
          </p>
          <div className="flex gap-3 pt-2">
            <Link href="/games" className="btn-primary">
              <Gamepad2 className="h-4 w-4" /> Top up a game
            </Link>
            <Link href="/smm" className="btn-ghost">
              <Megaphone className="h-4 w-4" /> Browse SMM services
            </Link>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        <Card
          title="Game Top-Ups"
          desc="Free Fire, PUBG, Mobile Legends, Valorant. Enter UID, confirm, done."
          href="/games"
          icon={<Gamepad2 className="h-5 w-5" />}
        />
        <Card
          title="SMM Marketplace"
          desc="Followers, views, likes across TikTok, YouTube, Instagram, Facebook."
          href="/smm"
          icon={<Megaphone className="h-5 w-5" />}
        />
        <Card
          title="Subscriptions"
          desc="Streaming, productivity and digital products."
          href="/subscriptions"
          icon={<Package className="h-5 w-5" />}
        />
      </section>
    </div>
  );
}

function Card({ title, desc, href, icon }: { title: string; desc: string; href: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="panel p-6 hover:border-brand-500/40 hover:shadow-glow transition group block"
    >
      <div className="flex items-center gap-3 text-brand-400 mb-3">
        <div className="h-10 w-10 rounded-xl bg-brand-500/15 grid place-items-center">{icon}</div>
        <h3 className="text-slate-100 font-semibold">{title}</h3>
      </div>
      <p className="text-sm text-slate-400">{desc}</p>
      <div className="mt-4 inline-flex items-center gap-1 text-xs text-brand-400 group-hover:gap-2 transition-all">
        Explore <ArrowRight className="h-3 w-3" />
      </div>
    </Link>
  );
}
