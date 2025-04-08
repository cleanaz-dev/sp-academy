//lib/emailHandlers.js
import juice from "juice";

// // Function to get type-specific data
export const getHandlerData = async (scheduleType, user) => {
  switch (scheduleType) {
    case "LESSON":
      return {
        lessonTitle: user.currentLesson?.title,
        dueDate: user.currentLesson?.dueDate,
        progress: user.lessonProgress,
      };
    case "BOOK":
      return {
        bookTitle: user.currentBook?.title,
        currentPage: user.readingProgress?.page,
        totalPages: user.currentBook?.totalPages,
        nextCheckpoint: user.readingProgress?.nextCheckpoint,
      };
    case "EXERCISE":
      return {
        exerciseName: user.currentExercise?.name,
        difficulty: user.currentExercise?.difficulty,
        lastAttempt: user.exerciseHistory?.lastAttempt,
      };
    case "COURSE":
      return {
        courseName: user.enrolledCourse?.name,
        completionPercentage: user.courseProgress?.percentage,
        nextModule: user.courseProgress?.nextModule,
      };
    default:
      return {
        firstName: user.firstName,
        email: user.email,
        membershipType: user.accountType,
      };
  }
};

// Function to render email content
export function renderEmailContent(template, user, context = {}) {
  const Handlebars = require("handlebars"); // Dynamic require
  const rawTemplate = template.designHtml.replace(
    "{{emailContent}}",
    template.content,
  );
  const compiledTemplate = Handlebars.compile(rawTemplate);

  const baseData = {
    name: user.name || "User",
    email: user.email,
  };

  let typeSpecificData = {};
  switch (template.handlebarsType) {
    case "Book":
      typeSpecificData = {
        books: context.books || [],
      };
      break;
    case "Lesson":
      typeSpecificData = {
        lesson: {
          title: context.lesson?.title || "Unnamed Lesson",
          description: context.lesson?.description || "",
          subject: context.lesson?.subject || "N/A",
          level: context.lesson?.level || null,
        },
        progress: {
          status: context.progress?.status || "Not Started",
          score: context.progress?.score || null,
          completedAt: context.progress?.completedAt
            ? new Date(context.progress.completedAt).toLocaleString()
            : null,
        },
      };
      break;
    case "Course":
      typeSpecificData = {
        course: {
          title: context.course?.title || "Unnamed Course",
        },
      };
      break;
    case "Exercise":
      typeSpecificData = {
        exercise: {
          name: context.exercise?.name || "Unnamed Exercise",
        },
      };
      break;
    default:
      console.warn(`Unknown handlebarsType: ${template.handlebarsType}`);
  }

  const data = { ...baseData, ...typeSpecificData };
  return compiledTemplate(data);
}

export function inlineEmailContent(htmlContent) {
  return juice(htmlContent);
}
// Function to determine if an email should be sent based on schedule
export function shouldSendEmail(schedule) {
  const now = new Date();

  const [hours, minutes] = schedule.timeOfDay.split(":");
  const scheduledTime = new Date();
  scheduledTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
  const windowStart = new Date(scheduledTime.getTime() - 2.5 * 60 * 1000);
  const windowEnd = new Date(scheduledTime.getTime() + 2.5 * 60 * 1000);

  if (!(now >= windowStart && now <= windowEnd)) {
    return false;
  }

  if (schedule.lastRun) {
    const lastRunDate = new Date(schedule.lastRun);

    if (lastRunDate.toDateString() === now.toDateString()) {
      return false;
    }
  }

  const currentDayName = now
    .toLocaleDateString("en-US", { weekday: "short" })
    .toUpperCase();
  const currentDayNumber = now.getDate();

  switch (schedule.frequency) {
    case "DAILY":
      return true;
    case "WEEKLY":
      if (!schedule.daysOfWeek) {
        return false;
      }

      return schedule.daysOfWeek.split(",").includes(currentDayName);
    case "MONTHLY":
      const startDay = schedule.startDate.getDate();
      const lastDay = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
      ).getDate();

      return (
        currentDayNumber === startDay ||
        (startDay > lastDay && currentDayNumber === lastDay)
      );
    default:
      return false;
  }
}

export function getUserQueryByType(templateType) {
  switch (templateType) {
    case "LESSON":
      return {
        select: {
          id: true,
          email: true,
          firstName: true,
          currentLesson: {
            select: {
              title: true,
              dueDate: true,
              progress: true,
            },
          },
        },
      };

    case "COURSE":
      return {
        select: {
          id: true,
          email: true,
          firstName: true,
          enrolledCourse: {
            select: {
              name: true,
              completionPercentage: true,
              nextModule: true,
            },
          },
        },
      };

    case "BOOK":
      return {
        select: {
          id: true,
          email: true,
          firstName: true,
          currentBook: {
            select: {
              title: true,
              currentPage: true,
              totalPages: true,
              nextCheckpoint: true,
            },
          },
        },
      };

    case "EXERCISE":
      return {
        select: {
          id: true,
          email: true,
          firstName: true,
          currentExercise: {
            select: {
              name: true,
              difficulty: true,
              lastAttempt: true,
            },
          },
        },
      };

    default:
      return {
        select: {
          id: true,
          email: true,
          firstName: true,
        },
      };
  }
}
