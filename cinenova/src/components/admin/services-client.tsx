"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

type ServiceRow = {
  id: string;
  name: string;
  category: string | null;
  providerName: string;
  vendorServiceId: string;
  vendorRate: number;
  sellRate: number;
  minQty: number;
  maxQty: number;
  isActive: boolean;
};

export function ServicesClient({
  services,
  providers,
  currentProviderId,
  currentQ,
}: {
  services: ServiceRow[];
  providers: { id: string; name: string }[];
  currentProviderId: string;
  currentQ: string;
}) {
  const router = useRouter();
  const [rows, setRows] = useState(services);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function patch(id: string, payload: Partial<ServiceRow>) {
    setBusyId(id);
    const res = await fetch(`/api/admin/smm/services/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setBusyId(null);
    if (res.ok) {
      setRows(rows.map((r) => (r.id === id ? { ...r, ...payload } : r)));
    } else {
      alert("Failed to update");
    }
  }
  async function remove(id: string) {
    if (!confirm("Delete this service?")) return;
    setBusyId(id);
    await fetch(`/api/admin/smm/services/${id}`, { method: "DELETE" });
    setBusyId(null);
    setRows(rows.filter((r) => r.id !== id));
  }

  return (
    <div className="space-y-4">
      <form className="flex gap-2 flex-wrap">
        <select name="providerId" defaultValue={currentProviderId} className="input max-w-[260px]">
          <option value="">All providers</option>
          {providers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <input
          name="q"
          defaultValue={currentQ}
          placeholder="Search service name, category, vendor id"
          className="input max-w-md"
        />
        <button className="btn-primary" onClick={() => router.refresh()}>
          Filter
        </button>
      </form>

      <div className="panel overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-bg-subtle text-slate-400">
            <tr>
              <Th>Service</Th>
              <Th>Provider</Th>
              <Th>Min/Max</Th>
              <Th>Vendor / Sell (per 1000)</Th>
              <Th>Active</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} className="border-t border-bg-border">
                <Td>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs text-slate-400">
                    {s.category ?? "Uncategorized"} · vendor#{s.vendorServiceId}
                  </div>
                </Td>
                <Td>{s.providerName}</Td>
                <Td className="text-xs">
                  {s.minQty} — {s.maxQty}
                </Td>
                <Td className="space-x-2">
                  <span className="text-slate-400 text-xs">vendor</span>
                  <span className="font-mono">{s.vendorRate.toFixed(2)}</span>
                  <span className="text-slate-500">→</span>
                  <input
                    type="number"
                    step="0.01"
                    defaultValue={s.sellRate}
                    onBlur={(e) => {
                      const v = Number(e.target.value);
                      if (!Number.isFinite(v) || v === s.sellRate) return;
                      patch(s.id, { sellRate: v });
                    }}
                    className="input w-28 inline-block"
                  />
                </Td>
                <Td>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={s.isActive}
                      onChange={(e) => patch(s.id, { isActive: e.target.checked })}
                    />
                    {s.isActive ? "Yes" : "No"}
                  </label>
                </Td>
                <Td>
                  <button onClick={() => remove(s.id)} className="btn-danger" disabled={busyId === s.id}>
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </Td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <Td colSpan={6}>
                  <div className="text-center py-10 text-slate-500">
                    No services. Use “Import” on the Providers page.
                  </div>
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
