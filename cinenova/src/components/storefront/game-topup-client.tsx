"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { money } from "@/lib/utils";
import { CheckCircle2, AlertCircle } from "lucide-react";

type Game = "FREE_FIRE" | "PUBG" | "MOBILE_LEGENDS" | "VALORANT";

const fields: Record<Game, { uidLabel: string; uidPlaceholder: string; needsZone?: boolean }> = {
  FREE_FIRE: { uidLabel: "Free Fire UID", uidPlaceholder: "e.g. 1234567890" },
  PUBG: { uidLabel: "PUBG UID", uidPlaceholder: "e.g. 5123456789012" },
  MOBILE_LEGENDS: { uidLabel: "Mobile Legends UID", uidPlaceholder: "e.g. 12345678", needsZone: true },
  VALORANT: { uidLabel: "Riot ID", uidPlaceholder: "Name#TAG" },
};

export function GameTopupClient({
  product,
}: {
  product: { id: string; name: string; topupAmount: string | null; sellPrice: number; currency: string; gameCode: Game };
}) {
  const router = useRouter();
  const cfg = fields[product.gameCode];
  const [uid, setUid] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [validating, setValidating] = useState(false);
  const [validated, setValidated] = useState<{ ok: boolean; username?: string | null; errors?: string[] } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function validate() {
    setValidating(true);
    setValidated(null);
    try {
      const res = await fetch("/api/game/validate-uid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameCode: product.gameCode, uid, zoneId: cfg.needsZone ? zoneId : undefined }),
      });
      const data = await res.json();
      setValidated({ ok: res.ok, username: data.username, errors: data.errors });
    } finally {
      setValidating(false);
    }
  }

  async function submit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/game/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          uid,
          zoneId: cfg.needsZone ? zoneId : undefined,
          payWithWallet: true,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/orders?ok=${data.order.orderNo}`);
      } else if (res.status === 401) {
        router.push("/login?next=/games/" + product.id);
      } else if (res.status === 402) {
        alert("Insufficient wallet balance. Top up your wallet first.");
      } else {
        alert(data.error ?? data.errors?.join("\n") ?? "Failed");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6">
      <div className="panel p-6 space-y-5">
        <div>
          <div className="text-sm text-slate-400">{product.topupAmount}</div>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
        </div>

        <div className="space-y-2">
          <div className="label">{cfg.uidLabel}</div>
          <input
            value={uid}
            onChange={(e) => {
              setUid(e.target.value);
              setValidated(null);
            }}
            placeholder={cfg.uidPlaceholder}
            className="input"
          />
        </div>

        {cfg.needsZone && (
          <div className="space-y-2">
            <div className="label">Zone ID</div>
            <input
              value={zoneId}
              onChange={(e) => {
                setZoneId(e.target.value);
                setValidated(null);
              }}
              placeholder="e.g. 2233"
              className="input max-w-[160px]"
            />
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={validate} disabled={!uid || validating} className="btn-ghost">
            {validating ? "Checking…" : "Check UID"}
          </button>
        </div>

        {validated && (
          <div
            className={`rounded-xl p-4 border ${
              validated.ok ? "border-success/30 bg-success/10" : "border-danger/30 bg-danger/10"
            }`}
          >
            {validated.ok ? (
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 className="h-4 w-4" /> UID looks valid{validated.username ? ` · ${validated.username}` : ""}
              </div>
            ) : (
              <div className="flex items-start gap-2 text-danger">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <div className="text-sm">
                  {validated.errors?.map((e, i) => (
                    <div key={i}>{e}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <aside className="panel p-6 h-fit space-y-4 sticky top-20">
        <div className="label">Order summary</div>
        <Row label="Product" value={product.name} />
        <Row label="Amount" value={product.topupAmount ?? "—"} />
        <Row label="UID" value={uid || <span className="text-slate-500">—</span>} mono />
        {cfg.needsZone && <Row label="Zone" value={zoneId || <span className="text-slate-500">—</span>} mono />}
        <hr className="border-bg-border" />
        <div className="flex justify-between">
          <span className="text-slate-400">Total</span>
          <span className="text-lg font-semibold">{money(product.sellPrice, product.currency)}</span>
        </div>
        <button
          onClick={submit}
          disabled={!validated?.ok || submitting}
          className="btn-primary w-full justify-center"
        >
          {submitting ? "Placing…" : "Pay with wallet"}
        </button>
        <p className="text-xs text-slate-500">
          Payment via wallet. Top up your wallet from <a className="text-brand-400" href="/account/wallet">Account → Wallet</a>.
        </p>
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
