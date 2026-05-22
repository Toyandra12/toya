"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Plus, RefreshCw, Trash2 } from "lucide-react";

type ProviderRow = {
  id: string;
  name: string;
  apiUrl: string;
  isActive: boolean;
  balance: number | null;
  lastSyncAt: string | null;
  services: number;
  orders: number;
};

export function ProvidersClient({ initial }: { initial: ProviderRow[] }) {
  const [items, setItems] = useState<ProviderRow[]>(initial);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", apiUrl: "", apiKey: "" });
  const [busyId, setBusyId] = useState<string | null>(null);
  const router = useRouter();

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    const res = await fetch("/api/admin/smm/providers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setAdding(false);
    if (res.ok) {
      setForm({ name: "", apiUrl: "", apiKey: "" });
      router.refresh();
    } else {
      alert((await res.json()).error ?? "Error");
    }
  }
  async function toggleActive(p: ProviderRow) {
    setBusyId(p.id);
    await fetch(`/api/admin/smm/providers/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !p.isActive }),
    });
    setBusyId(null);
    setItems(items.map((x) => (x.id === p.id ? { ...x, isActive: !p.isActive } : x)));
  }
  async function test(p: ProviderRow) {
    setBusyId(p.id);
    const res = await fetch(`/api/admin/smm/providers/${p.id}/test`, { method: "POST" });
    const data = await res.json();
    setBusyId(null);
    alert(data.ok ? `Connected. Response: ${JSON.stringify(data.response)}` : `Failed: ${JSON.stringify(data)}`);
  }
  async function importSvcs(p: ProviderRow) {
    if (!confirm(`Import services from ${p.name}? Default margin 35%.`)) return;
    setBusyId(p.id);
    const res = await fetch(`/api/admin/smm/import-services`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ providerId: p.id }),
    });
    const data = await res.json();
    setBusyId(null);
    alert(res.ok ? `Imported ${data.imported} services.` : `Failed: ${data.error}`);
    router.refresh();
  }
  async function remove(p: ProviderRow) {
    if (!confirm(`Delete provider ${p.name}? This removes its services and orders.`)) return;
    setBusyId(p.id);
    await fetch(`/api/admin/smm/providers/${p.id}`, { method: "DELETE" });
    setBusyId(null);
    setItems(items.filter((x) => x.id !== p.id));
  }

  return (
    <div className="space-y-6">
      <form onSubmit={create} className="panel p-5 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <Field label="Name">
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input"
            placeholder="My SMM Panel"
          />
        </Field>
        <Field label="API URL">
          <input
            required
            type="url"
            value={form.apiUrl}
            onChange={(e) => setForm({ ...form, apiUrl: e.target.value })}
            className="input"
            placeholder="https://panel.example/api/v2"
          />
        </Field>
        <Field label="API Key">
          <input
            required
            value={form.apiKey}
            onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
            className="input"
            placeholder="paste key"
          />
        </Field>
        <button className="btn-primary" disabled={adding}>
          <Plus className="h-4 w-4" /> {adding ? "Adding…" : "Add provider"}
        </button>
      </form>

      <div className="panel overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg-subtle text-slate-400">
            <tr>
              <Th>Provider</Th>
              <Th>Status</Th>
              <Th>Balance</Th>
              <Th>Services</Th>
              <Th>Orders</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t border-bg-border">
                <Td>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-slate-400">{p.apiUrl}</div>
                </Td>
                <Td>
                  <span className={p.isActive ? "pill-success" : "pill-muted"}>
                    {p.isActive ? "Active" : "Disabled"}
                  </span>
                </Td>
                <Td>{p.balance == null ? "—" : p.balance.toFixed(2)}</Td>
                <Td>{p.services}</Td>
                <Td>{p.orders}</Td>
                <Td className="space-x-2 whitespace-nowrap">
                  <button onClick={() => test(p)} className="btn-ghost" disabled={busyId === p.id}>
                    {busyId === p.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Test
                  </button>
                  <button onClick={() => importSvcs(p)} className="btn-ghost" disabled={busyId === p.id}>
                    <RefreshCw className="h-4 w-4" /> Import
                  </button>
                  <button onClick={() => toggleActive(p)} className="btn-ghost" disabled={busyId === p.id}>
                    {p.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                    {p.isActive ? "Disable" : "Enable"}
                  </button>
                  <button onClick={() => remove(p)} className="btn-danger" disabled={busyId === p.id}>
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </Td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <Td colSpan={6}>
                  <div className="text-center py-10 text-slate-500">No providers configured.</div>
                </Td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="label">{label}</div>
      {children}
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
