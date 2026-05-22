import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";

const Update = z.object({
  name: z.string().min(2).max(80).optional(),
  apiUrl: z.string().url().optional(),
  apiKey: z.string().min(8).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const parsed = Update.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const provider = await prisma.smmProvider.update({ where: { id }, data: parsed.data });
  await prisma.activityLog.create({
    data: { actorId: auth.user.id, actorRole: auth.user.role, action: "smm.provider.update", target: id, meta: parsed.data },
  });
  return NextResponse.json({ provider });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  await prisma.smmProvider.delete({ where: { id } });
  await prisma.activityLog.create({
    data: { actorId: auth.user.id, actorRole: auth.user.role, action: "smm.provider.delete", target: id },
  });
  return NextResponse.json({ ok: true });
}
