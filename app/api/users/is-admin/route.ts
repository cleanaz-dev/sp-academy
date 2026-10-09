import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-guard"; // 👈 Use getSession, NOT requireAdmin

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ isAdmin: false }, { status: 200 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    return NextResponse.json({ 
      isAdmin: dbUser?.role === "ADMIN" 
    });
  } catch (error) {
    console.error("[IS_ADMIN_ERROR]", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}