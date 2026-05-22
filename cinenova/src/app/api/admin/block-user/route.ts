import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";
import { UserStatus } from "@prisma/client";

const Body = z.object({
  userId: z.string().min(1),
  block: z.boolean(),
});

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const user = await prisma.user.update({
    where: { id: parsed.data.userId },
    data: { status: parsed.data.block ? UserStatus.BLOCKED : UserStatus.ACTIVE },
  });
  await prisma.activityLog.create({
    data: {
      actorId: auth.user.id,
      actorRole: auth.user.role,
      action: parsed.data.block ? "user.block" : "user.unblock",
      target: parsed.data.userId,
    },
  });
  return NextResponse.json({ user: { id: user.id, status: user.status } });
}
