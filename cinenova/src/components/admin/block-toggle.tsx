"use client";
import { useState } from "react";

export function BlockToggle({ userId, blocked }: { userId: string; blocked: boolean }) {
  const [busy, setBusy] = useState(false);
  const [isBlocked, setBlocked] = useState(blocked);
  async function toggle() {
    setBusy(true);
    const res = await fetch("/api/admin/block-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, block: !isBlocked }),
    });
    if (res.ok) setBlocked(!isBlocked);
    setBusy(false);
  }
  return (
    <button onClick={toggle} disabled={busy} className={isBlocked ? "btn-primary" : "btn-danger"}>
      {busy ? "…" : isBlocked ? "Unblock" : "Block"}
    </button>
  );
}
