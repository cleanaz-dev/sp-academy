// "use server";

// import { prisma } from "@/lib/prisma";
// import { requireUser } from "@/lib/auth-guard";
// import { invokeEduBuilder } from "./invoke-edu-builder";
// import { completeVocabBridge } from "./complete-vocab-bridge"; // adjust import path if needed

// export async function retryGeneration(courseId: string) {
//   const user = await requireUser();

//   const course = await prisma.foundationCourse.findFirst({
//     where: { id: courseId, userId: user.id },
//     include: {
//       lessons: {
//         orderBy: { orderIndex: "asc" },
//         include: { bridge: true, bossStage: true },
//       },
//     },
//   });

//   if (!course) return { ok: false, error: "Course not found" };

//   // 1. Check if a Spoon is stuck building (no title and no visualContent)
//   const stuckSpoon = course.lessons.find(
//     (l) => !l.completedAt && !l.title && !l.visualContent
//   );

//   if (stuckSpoon) {
//     return await invokeEduBuilder({
//       userId: user.id,
//       firstName: user.firstName || user.name || "there",
//       gender: user.gender || "N",
//       foundationCourseId: course.id,
//       spoon: stuckSpoon.orderIndex,
//       nativeLanguage: course.nativeLanguage,
//       targetLanguage: course.targetLanguage,
//       levelBand: "beginner",
//       goal: "general",
//       scriptComfort: "latin",
//       type: "lang",
//       isOnboarding: stuckSpoon.orderIndex === 1,
//     });
//   }

//   // 2. Check if a completed Spoon is missing its Vocab Bridge
//   const stuckBridgeLesson = course.lessons.find(
//     (l) => l.completedAt && !l.bridge
//   );
//   if (stuckBridgeLesson) {
//     // Reset completedAt & re-run or re-trigger the lesson/bridge
//     await prisma.foundationLesson.update({
//       where: { id: stuckBridgeLesson.id },
//       data: { title: null, visualContent: undefined, completedAt: null },
//     });
//     return await invokeEduBuilder({
//       userId: user.id,
//       firstName: user.firstName || user.name || "there",
//       gender: user.gender || "N",
//       foundationCourseId: course.id,
//       spoon: stuckBridgeLesson.orderIndex,
//       nativeLanguage: course.nativeLanguage,
//       targetLanguage: course.targetLanguage,
//       levelBand: "beginner",
//       goal: "general",
//       scriptComfort: "latin",
//       type: "lang",
//       isOnboarding: false,
//     });
//   }

//   // 3. Check if Boss Stage is stuck
//   const lastCompletedBridge = [...course.lessons]
//     .reverse()
//     .find((l) => l.bridge?.passed && l.orderIndex % 3 === 0)?.bridge;

//   if (lastCompletedBridge) {
//     return await completeVocabBridge(lastCompletedBridge.id);
//   }

//   return { ok: false, error: "Nothing stuck to retry" };
// }