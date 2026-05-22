"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { money } from "@/lib/utils";

type Svc = {
  id: string;
  name: string;
  category: string | null;
  minQty: number;
  maxQty: number;
  sellRate: number;
};

export function SmmOrderClient({ service }: { service: Svc }) {
  const router = useRouter();
  const [link, setLink] = useState("");
  const [qty, setQty] = useState(service.minQty);
  const [submitting, setSubmitting] = useState(false);

  const total = useMemo(() => +(service.sellRate * (qty / 1000)).toFixed(2), [qty, service.sellRate]);
  const valid = qty >= service.minQty && qty <= service.maxQty && /^https?:\/\//i.test(link);

  async function submit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/smm/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId: service.id, link, quantity: qty, payWithWallet: true }),
      });
      const data = await res.json();
      if (res.ok) router.push(`/orders?ok=${data.order.orderNo}`);
      else if (res.status === 401) router.push("/login?next=/smm/" + service.id);
      else alert(data.error ?? "Failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6">
      <div className="panel p-6 space-y-5">
        <div>
          <div className="text-sm text-slate-400">{service.category ?? "General"}</div>
          <h1 className="text-2xl font-semibold">{service.name}</h1>
          <div className="text-xs text-slate-500 mt-1">
            Range {service.minQty.toLocaleString()} – {service.maxQty.toLocaleString()}
          </div>
        </div>

        <div className="space-y-2">
          <div className="label">Link or Username</div>
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://www.tiktok.com/@yourname"
            className="input"
          />
        </div>

        <div className="space-y-2">
          <div className="label">Quantity</div>
          <input
            type="number"
            min={service.minQty}
            max={service.maxQty}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value || 0))}
            className="input max-w-[200px]"
          />
        </div>
      </div>

      <aside className="panel p-6 h-fit space-y-4 sticky top-20">
        <div className="label">Order summary</div>
        <Row label="Service" value={service.name} />
        <Row label="Quantity" value={qty.toLocaleString()} />
        <Row label="Rate (per 1k)" value={service.sellRate.toFixed(2)} mono />
        <hr className="border-bg-border" />
        <div className="flex justify-between">
          <span className="text-slate-400">Total</span>
          <span className="text-lg font-semibold">{money(total)}</span>
        </div>
        <button onClick={submit} disabled={!valid || submitting} className="btn-primary w-full justify-center">
          {submitting ? "Placing…" : "Pay with wallet"}
        </button>
      </aside>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-400">{label}</span>
      <span className={mono ? "font-mono" : ""}>{value}</span>
    </div>
  );
}
