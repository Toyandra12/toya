"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setErr(data.error ?? "Invalid credentials");
      return;
    }
    const next = sp.get("next") ?? (data.user.role !== "USER" ? "/admin" : "/");
    router.push(next);
    router.refresh();
  }

  return (
    <div className="max-w-md mx-auto panel p-8 space-y-5">
      <h1 className="text-2xl font-semibold">Welcome back</h1>
      <form onSubmit={submit} className="space-y-3">
        <div className="space-y-1">
          <div className="label">Email</div>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
        </div>
        <div className="space-y-1">
          <div className="label">Password</div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
        </div>
        {err && <div className="text-danger text-sm">{err}</div>}
        <button className="btn-primary w-full justify-center" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="text-sm text-slate-400">
        No account?{" "}
        <Link href="/register" className="text-brand-400">
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}
