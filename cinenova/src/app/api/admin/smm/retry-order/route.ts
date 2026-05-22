import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/rbac";
import { retryOrder } from "@/lib/smm-engine";
import { prisma } from "@/lib/prisma";

const Body = z.object({ smmOrderId: z.string().min(1) });

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  try {
    const order = await retryOrder(parsed.data.smmOrderId);
    await prisma.activityLog.create({
      data: { actorId: auth.user.id, actorRole: auth.user.role, action: "smm.order.retry", target: parsed.data.smmOrderId },
    });
    return NextResponse.json({ order });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
