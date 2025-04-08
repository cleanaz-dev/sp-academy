import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Resend } from "resend";
import Bottleneck from "bottleneck";
import {
  shouldSendEmail,
  renderEmailContent,
  inlineEmailContent,
} from "@/lib/emailUtils";

const resend = new Resend(process.env.RESEND_API_KEY);

const limiter = new Bottleneck({
  minTime: 12000, // 12 seconds between requests
  maxConcurrent: 1,
});

export async function GET(request) {
  console.log("----------- STARTING SCHEDULE PROCESSING -----------");

  const apiKey = request.headers.get("x-api-key");
  if (apiKey !== process.env.EASYCRON_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    console.log("Current time:", now.toISOString());

    const schedules = await prisma.emailSchedule.findMany({
      where: {
        status: "ACTIVE",
        OR: [{ endDate: null }, { endDate: { gte: now } }],
        startDate: { lte: now },
      },
      include: {
        template: true,
        UserSchedule: {
          include: {
            user: {
              include: {
                Book: true,
                Progress: { include: { lesson: true } },
              },
            },
          },
        },
      },
    });

    console.log(`Found ${schedules.length} active schedules`);

    const schedulesToSend = schedules.filter((schedule) => {
      const shouldSend = shouldSendEmail(schedule);
      return shouldSend;
    });
    console.log(`Processing ${schedulesToSend.length} schedules for sending`);

    const sendEmailWithRateLimit = limiter.wrap(
      async (to, subject, htmlContent) => {
        console.log(`Sending email to: ${to}, subject: ${subject}`);
        const result = await resend.emails.send({
          from: process.env.RESEND_SENDER_EMAIL,
          to: to,
          subject: subject,
          html: htmlContent,
        });
        console.log(`Email sent to ${to}, result:`, result);
        return result;
      },
    );

    const results = await Promise.all(
      schedulesToSend.map(async (schedule) => {
        try {
          console.log(
            `Processing schedule ${schedule.id} with ${schedule.UserSchedule.length} users`,
          );
          if (schedule.UserSchedule.length === 0) {
            console.log(`Schedule ${schedule.id} has no users, skipping`);
            await prisma.scheduleExecutionLog.create({
              data: {
                scheduleId: schedule.id,
                runAt: now,
                status: "skipped",
                details: "No users assigned to this schedule",
              },
            });
            return {
              success: false,
              scheduleId: schedule.id,
              error: "No recipients",
            };
          }

          const emailPromises = schedule.UserSchedule.map(
            async (userSchedule) => {
              console.log(
                `Preparing email for user ${userSchedule.user.email}`,
              );
              const context = await getEmailContext(
                schedule,
                userSchedule.user,
              );
              const rawHtml = renderEmailContent(
                schedule.template,
                userSchedule.user,
                context,
              );

              const inlinedHtml = inlineEmailContent(rawHtml);
              return sendEmailWithRateLimit(
                userSchedule.user.email,
                schedule.template.subject,
                inlinedHtml,
              );
            },
          );

          const emailResults = await Promise.all(emailPromises);
          console.log(
            `Email results for schedule ${schedule.id}:`,
            emailResults,
          );

          await prisma.$transaction([
            prisma.emailSchedule.update({
              where: { id: schedule.id },
              data: { lastRun: now },
            }),
            prisma.scheduleExecutionLog.create({
              data: {
                scheduleId: schedule.id,
                runAt: now,
                status: "success",
                details: `Emails sent successfully to ${schedule.UserSchedule.length} recipients. Message IDs: ${emailResults.map((r) => r.id).join(", ")}`,
              },
            }),
          ]);

          return {
            success: true,
            scheduleId: schedule.id,
            recipientCount: schedule.UserSchedule.length,
            messageIds: emailResults.map((r) => r.id),
          };
        } catch (error) {
          console.error(`Error processing schedule ${schedule.id}:`, error);
          await prisma.scheduleExecutionLog.create({
            data: {
              scheduleId: schedule.id,
              runAt: now,
              status: "failure",
              details: `Error: ${error.message}. Failed to send to recipients: ${schedule.UserSchedule.map((us) => us.user.email).join(", ")}`,
            },
          });

          return {
            success: false,
            scheduleId: schedule.id,
            error: error.message,
            recipients: schedule.UserSchedule.map((us) => us.user.email),
          };
        }
      }),
    );

    console.log("Processing results:", results);

    const successfulSends = results.filter((r) => r.success);
    const totalRecipients = results.reduce(
      (sum, r) => sum + (r.success ? r.recipientCount : 0),
      0,
    );

    console.log(
      `Successful schedules: ${successfulSends.length}, Total emails sent: ${totalRecipients}`,
    );

    return NextResponse.json({
      message: "Processing complete",
      processed: schedules.length,
      schedulesProcessed: results.length,
      successfulSchedules: successfulSends.length,
      failedSchedules: results.length - successfulSends.length,
      totalEmailsSent: totalRecipients,
      results: results,
    });
  } catch (error) {
    console.error("Top-level processing error:", error);
    await prisma.scheduleExecutionLog.create({
      data: {
        scheduleId: "system",
        runAt: new Date(),
        status: "failure",
        details: `Process Error: ${error.message}`,
      },
    });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

async function getEmailContext(schedule, user) {
  switch (schedule.template.handlebarsType) {
    case "Book": {
      const books =
        user.Book.filter((b) => b.isReading && !b.isCompleted) || [];
      console.log(`Books for user ${user.email}:`, books);
      return { books: books };
    }
    case "Lesson": {
      const progress =
        user.Progress.find((p) => p.status === "COMPLETED") ||
        user.Progress[0] ||
        null;
      const lesson = progress ? progress.lesson : null;
      return { lesson, progress };
    }
    case "Course":
      return { course: { title: "Placeholder Course" } };
    case "Exercise":
      return { exercise: { name: "Placeholder Exercise" } };
    default:
      return {};
  }
}
