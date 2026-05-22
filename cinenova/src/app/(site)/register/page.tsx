"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, phone: phone || undefined }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setErr(data.error ?? "Failed");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="max-w-md mx-auto panel p-8 space-y-5">
      <h1 className="text-2xl font-semibold">Create your account</h1>
      <form onSubmit={submit} className="space-y-3">
        <div className="space-y-1">
          <div className="label">Name</div>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="input" />
        </div>
        <div className="space-y-1">
          <div className="label">Email</div>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
        </div>
        <div className="space-y-1">
          <div className="label">Phone (optional)</div>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input" />
        </div>
        <div className="space-y-1">
          <div className="label">Password</div>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
        </div>
        {err && <div className="text-danger text-sm">{err}</div>}
        <button className="btn-primary w-full justify-center" disabled={busy}>
          {busy ? "Creating…" : "Create account"}
        </button>
      </form>
      <p className="text-sm text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="text-brand-400">
          Sign in
        </Link>
      </p>
    </div>
  );
}
