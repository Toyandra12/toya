import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";

const Update = z.object({
  isActive: z.boolean().optional(),
  sellRate: z.number().nonnegative().optional(),
  name: z.string().min(2).max(160).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const parsed = Update.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const service = await prisma.smmService.update({ where: { id }, data: parsed.data });
  await prisma.activityLog.create({
    data: { actorId: auth.user.id, actorRole: auth.user.role, action: "smm.service.update", target: id, meta: parsed.data },
  });
  return NextResponse.json({ service });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  await prisma.smmService.delete({ where: { id } });
  await prisma.activityLog.create({
    data: { actorId: auth.user.id, actorRole: auth.user.role, action: "smm.service.delete", target: id },
  });
  return NextResponse.json({ ok: true });
}
