import { moonshotAPI } from '../client';
import type { TranslationParams, TranslationResponse } from '../types';

export const getMessageTranslation = async (
  params: TranslationParams
): Promise<TranslationResponse> => {
  const { message, nativeLanguage } = params;
  
  const completion = await moonshotAPI.chat.completions.create({
    model: 'kimi-k2-turbo-preview',
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