import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  return NextResponse.json({ message: "ok" }, { status: 200 });
}