import { groq, GROQ_MODELS } from "@/lib/groq";
import type { TranslationParams, TranslationResponse } from "../types";

export const getMessageTranslation = async (
  params: TranslationParams,
): Promise<TranslationResponse> => {
  const { message, nativeLanguage } = params;

  const completion = await groq.chat.completions.create({
    model: GROQ_MODELS.GPT_OSS_20B,
    messages: [
      {
        role: "user",
        content: `Translate "${message}" into ${nativeLanguage}, output translation only.`,
      },
    ],
    temperature: 0.1, // Lower temp for accurate translations
    reasoning_effort: "low", // keep thinking tokens from eating the budget
    max_tokens: 1000,
  });

  const translation = completion.choices[0]?.message?.content?.trim();

  if (!translation) {
    console.warn(
      "[translation] Empty response, finish_reason:",
      completion.choices[0]?.finish_reason,
    );
  }

  return {
    messageTranslation: translation || message, // fallback to original
  };
};