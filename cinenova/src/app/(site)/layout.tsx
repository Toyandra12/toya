import SiteHeader from "@/components/site-header";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
      <footer className="border-t border-bg-border mt-20">
        <div className="max-w-7xl mx-auto px-4 py-6 text-xs text-slate-500">
          © {new Date().getFullYear()} CineNova · All systems on dark mode.
        </div>
      </footer>
    </>
  );
}
