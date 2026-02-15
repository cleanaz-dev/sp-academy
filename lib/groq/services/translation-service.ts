import { groq, GROQ_MODELS } from '@/lib/groq';
import type { TranslationParams, TranslationResponse } from '../types';

export const getMessageTranslation = async (
  params: TranslationParams
): Promise<TranslationResponse> => {
  const { message, nativeLanguage } = params;
  
  const completion = await groq.chat.completions.create({
    model: GROQ_MODELS.GPT_OSS_20B,
    messages: [
      { 
        role: 'user', 
        content: `Translate "${message}" into ${nativeLanguage}, output translation only.` 
      }
    ],
    temperature: 0.1, // Lower temp for accurate translations
    max_tokens: 500,
  });

  return {
    messageTranslation: completion.choices[0].message.content || message, // fallback to original
  };
};