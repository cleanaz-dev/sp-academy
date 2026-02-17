import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { miniMax, MINIMAX_MODELS } from "@/lib/minimax";

export interface GrammarMistake {
  original: string;
  corrected: string;
  explanation: string;
  type: "grammar" | "vocabulary" | "accent" | "spelling";
}

export interface ConversationAnalysis {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  grammarMistakes: GrammarMistake[];
  vocabularyUsed: string[];
  recommendedVocabulary: string[];
  overallScore: number;
  fluencyScore: number;
  accuracyScore: number;
  nextSteps: string[];
}

function toJson<T>(data: T): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(data)) as Prisma.InputJsonValue;
}

export async function analyzeConversation(
  conversationRecordId: string,
  userId: string,
): Promise<ConversationAnalysis> {
  const record = await prisma.conversationRecord.findUnique({
    where: { id: conversationRecordId },
    include: { conversation: true },
  });

  if (!record) throw new Error("Conversation record not found");

  const messages = record.messages as any[];
  const conversation = record.conversation;

  // Only extract user messages for mistake analysis
  const userMessages = messages
    .filter((m: any) => m.role === "user")
    .map((m: any) => m.content)
    .join("\n");

  // Full transcript for context
  const transcript = messages
    .map((m: any) => `${m.role === "user" ? "Student" : "Tutor"}: ${m.content}`)
    .join("\n");

  const response = await miniMax.messages.create({
    model: MINIMAX_MODELS.M2_5,
    max_tokens: 2000,
    system: `You are a language learning coach reviewing a student's ${conversation.tutorLanguage} conversation practice.
The student's native language is ${conversation.nativeLanguage}.

Your job is to:
1. Analyze ONLY the student's messages for mistakes
2. Identify grammar errors, missing accents, wrong vocabulary, spelling mistakes
3. Provide corrected versions with clear explanations the student can study later
4. Give an overall assessment of the session

Return a JSON object with this exact structure, no markdown:
{
  "summary": "Overall summary of how the student performed",
  "strengths": ["thing they did well"],
  "weaknesses": ["areas to improve"],
  "grammarMistakes": [
    {
      "original": "exactly what the student wrote",
      "corrected": "the correct version",
      "explanation": "clear explanation of why it is wrong and how to remember the correct form",
      "type": "grammar | vocabulary | accent | spelling"
    }
  ],
  "vocabularyUsed": ["words the student used correctly"],
  "recommendedVocabulary": ["words they should learn based on the conversation topic"],
  "overallScore": 75,
  "fluencyScore": 80,
  "accuracyScore": 70,
  "nextSteps": ["specific actionable things to practice"]
}`,
    messages: [
      {
        role: "user",
        content: `Full conversation for context:\n${transcript}\n\nStudent messages to analyze for mistakes:\n${userMessages}`,
      },
    ],
  });

  const rawText =
    response.content[0].type === "text" ? response.content[0].text : "";

  const analysis: ConversationAnalysis = JSON.parse(rawText);

  await Promise.all([
    // Save full analysis to the conversation record
    prisma.conversationRecord.update({
      where: { id: conversationRecordId },
      data: { analysis: toJson(analysis) },
    }),
    // Save mistakes to review so the student can study them later
    prisma.conversationReview.upsert({
      where: { conversationId: conversation.id },
      update: {
        mistakes: analysis.grammarMistakes.map(toJson),
      },
      create: {
        userId,
        conversationId: conversation.id,
        mistakes: analysis.grammarMistakes.map(toJson),
      },
    }),
  ]);

  return analysis;
}