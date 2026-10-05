import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireUser() {
  const session = await getSession();
  if (!session?.user) redirect("/sign-in");
  return session.user;
}

// For API routes: returns { user } on success, or { error } with a NextResponse to return
export async function requireAdmin() {
  const session = await getSession();
  if (!session?.user) {
    return {
      error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true },
  });

  if (!dbUser || dbUser.role !== "ADMIN") {
    return {
      error: NextResponse.json({ message: "Forbidden Request" }, { status: 403 }),
    };
  }

  return { user: dbUser };
}