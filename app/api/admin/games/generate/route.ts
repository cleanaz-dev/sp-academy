import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const isUserAdmin = await prisma.user.findUnique({
    where: { userId },
    select: { id: true, role: true },
  });

  if (!isUserAdmin || isUserAdmin.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden Request" }, { status: 403 });
  }

  return NextResponse.json({ message: "ok" }, { status: 200 });
}
