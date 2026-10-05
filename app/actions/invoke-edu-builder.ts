"use server";
import { lambda, createCommand } from "@/lib/aws/lambda";
import { JsonValue } from "@prisma/client/runtime/library";
import { setupFirstLesson } from "@/lib/foundation/setup-first-lesson"; // update path as needed
import { setupNextLesson } from "@/lib/foundation/setup-next-lesson";   // update path as needed

export interface InvokeEduBuilderPayload {
  userId: string;
  firstName: string;
  gender: string;
  foundationCourseId?: string;
  spoon: number;
  nativeLanguage: string;
  targetLanguage: string;
  levelBand: string;
  goal: string;
  scriptComfort: string;
  type: string;
  isOnboarding: boolean;
  previous_lessons?: JsonValue[];
  sessionId?: string;
}

export async function invokeEduBuilder(payload: InvokeEduBuilderPayload) {
  
  // 1. Call the appropriate DB setup function based on isOnboarding
  const dbContext = payload.isOnboarding
    ? await setupFirstLesson(payload)
    : await setupNextLesson(payload);

  // 2. Construct final payload for the Lambda (includes the newly created DB IDs!)
  // If 'previous_lessons' is in the payload, the spread operator (...) automatically includes it.
  const lambdaPayload = {
    ...payload,
    foundationCourseId: dbContext.courseId,
    foundationLessonId: dbContext.lessonId, // Allows the Lambda to update the DB row when finished
  };

  console.log("Invoking edu builder with payload:", lambdaPayload);

  // 3. Trigger the Lambda
  const command = createCommand({
    functionName: "spoon-edu-builder",
    payload: JSON.stringify(lambdaPayload),
    invocationType: "Event",
  });
  
  console.log("Sending command to edu builder:", command);

  try {
    const response = await lambda.send(command);

    if (response.Payload) {
      const resultString = new TextDecoder("utf-8").decode(response.Payload);
      const result = JSON.parse(resultString);
      console.log("✅ Lambda Response:", result);
    } else {
      console.log(
        "✅ Async Lambda invoked successfully (Status:",
        response.StatusCode,
        ")",
      );
    }
  } catch (error) {
    console.error("❌ Error invoking Lambda:", error);
    console.log("🕒 Run failed at:", new Date().toISOString());
  }
}