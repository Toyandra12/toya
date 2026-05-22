import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/rbac";
import { testConnection } from "@/lib/smm-engine";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  try {
    const result = await testConnection(id);
    return NextResponse.json({ ok: result.ok, statusCode: result.statusCode, response: result.response });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
