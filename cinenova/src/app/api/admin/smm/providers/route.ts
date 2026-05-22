import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";

const Create = z.object({
  name: z.string().min(2).max(80),
  apiUrl: z.string().url(),
  apiKey: z.string().min(8),
  isActive: z.boolean().optional(),
});

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const providers = await prisma.smmProvider.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { services: true, orders: true } } },
  });
  return NextResponse.json({ providers });
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const parsed = Create.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const provider = await prisma.smmProvider.create({ data: parsed.data });
  await prisma.activityLog.create({
    data: { actorId: auth.user.id, actorRole: auth.user.role, action: "smm.provider.create", target: provider.id },
  });
  return NextResponse.json({ provider });
}
