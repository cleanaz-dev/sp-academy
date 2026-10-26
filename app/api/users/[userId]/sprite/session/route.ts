// app/api/users/[userId]/sprite/sessions/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isUser } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const user = await isUser(userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const profile = await prisma.spriteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!profile) {
    return NextResponse.json({ sessions: [] });
  }

  const sessions = await prisma.spriteSession.findMany({
    where: { spriteProfileId: profile.id },
    orderBy: { updatedAt: "desc" },
    take: 30,
  });

  return NextResponse.json({ sessions });
}