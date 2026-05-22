import { NextResponse } from "next/server";
import { getCurrentUser } from "./auth";
import { UserRole, UserStatus } from "@prisma/client";

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) } as const;
  }
  if (user.status === UserStatus.BLOCKED) {
    return { error: NextResponse.json({ error: "Account blocked" }, { status: 403 }) } as const;
  }
  return { user } as const;
}

export async function requireAdmin() {
  const r = await requireUser();
  if ("error" in r) return r;
  if (r.user.role !== UserRole.ADMIN && r.user.role !== UserRole.SUPERADMIN) {
    return { error: NextResponse.json({ error: "Admin required" }, { status: 403 }) } as const;
  }
  return r;
}
