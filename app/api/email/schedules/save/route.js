//api/email/schedules/save/route.js
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// api/email/schedules/save/route.js
export async function POST(request) {
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

    const data = await request.json();
    console.log("data: ", data);

    // Create the schedule
    const schedule = await prisma.emailSchedule.create({
      data: {
        scheduleName: data.scheduleName,
        templateId: data.templateId,
        frequency: data.frequency,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        timeOfDay: data.timeOfDay,
        daysOfWeek: data.daysOfWeek,
        timeZone: data.timeZone || "UTC",
      },
      include: { template: true },
    });

    // Create UserSchedule entries for each recipient
    const userSchedules = data.recipients.map((recipient) => ({
      userId: recipient.id,
      scheduleId: schedule.id,
    }));

    await prisma.userSchedule.createMany({
      data: userSchedules,
    });

    return NextResponse.json(
      {
        message: "Email schedule created successfully",
        schedule,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error creating email schedule:", error);
    return NextResponse.json(
      {
        error: "An error occurred while creating the email schedule.",
      },
      { status: 500 },
    );
  }
}
