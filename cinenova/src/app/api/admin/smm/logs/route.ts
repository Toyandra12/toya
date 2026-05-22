import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const url = new URL(req.url);
  const providerId = url.searchParams.get("providerId") ?? undefined;
  const onlyFailed = url.searchParams.get("onlyFailed") === "1";
  const take = Math.min(Number(url.searchParams.get("take") ?? 50), 200);
  const logs = await prisma.smmApiLog.findMany({
    where: {
      providerId,
      ok: onlyFailed ? false : undefined,
    },
    orderBy: { createdAt: "desc" },
    take,
    include: { provider: { select: { id: true, name: true } } },
  });
  return NextResponse.json({ logs });
}
