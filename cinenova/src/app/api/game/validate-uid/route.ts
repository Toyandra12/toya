import { NextResponse } from "next/server";
import { z } from "zod";
import { GameCode } from "@prisma/client";
import { validateUid } from "@/lib/uid-validator";

const Body = z.object({
  gameCode: z.nativeEnum(GameCode),
  uid: z.string().min(1).max(64),
  zoneId: z.string().min(1).max(16).optional(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const result = validateUid(parsed.data);
  return NextResponse.json(result, { status: result.ok ? 200 : 422 });
}
