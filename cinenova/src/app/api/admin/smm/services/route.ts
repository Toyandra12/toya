import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const url = new URL(req.url);
  const providerId = url.searchParams.get("providerId") ?? undefined;
  const q = url.searchParams.get("q") ?? undefined;
  const take = Math.min(Number(url.searchParams.get("take") ?? 50), 200);
  const skip = Number(url.searchParams.get("skip") ?? 0);

  const services = await prisma.smmService.findMany({
    where: {
      providerId,
      OR: q
        ? [
            { name: { contains: q, mode: "insensitive" } },
            { category: { contains: q, mode: "insensitive" } },
            { vendorServiceId: { contains: q, mode: "insensitive" } },
          ]
        : undefined,
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
    include: { provider: { select: { id: true, name: true } } },
    take,
    skip,
  });
  const total = await prisma.smmService.count({
    where: { providerId },
  });
  return NextResponse.json({ services, total });
}
