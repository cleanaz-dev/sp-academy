import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const user = await prisma.user.findFirst({ where: { userId: userId } });

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You are not an admin" },
        { status: 403 },
      );
    }

    const emailSchedules = await prisma.emailSchedule.findMany();

    return NextResponse.json(
      {
        message: "Data processed successfully!",
        data: emailSchedules,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error processing data:", error.message);
    return NextResponse.json(
      { error: "An error occurred while processing data." },
      { status: 500 },
    );
  }
}
