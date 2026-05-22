import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/rbac";
import { importServices } from "@/lib/smm-engine";
import { prisma } from "@/lib/prisma";

const Body = z.object({
  providerId: z.string().min(1),
  marginPct: z.number().min(0).max(500).optional(),
});

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  try {
    const result = await importServices(parsed.data.providerId, parsed.data.marginPct ?? 35);
    await prisma.activityLog.create({
      data: {
        actorId: auth.user.id,
        actorRole: auth.user.role,
        action: "smm.services.import",
        target: parsed.data.providerId,
        meta: result,
      },
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
