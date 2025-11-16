import { moonshotAPI } from '../client';
import { getConversationPrompt } from '../prompts/conversation-dialog';
import type { ConversationParams, AIResponse } from '../types';

// Just export functions, no classes needed
export const sendMessage = async (params: ConversationParams): Promise<AIResponse> => {
  const prompt = getConversationPrompt(params);
  
  const completion = await moonshotAPI.chat.completions.create({
    model: 'kimi-k2-turbo-preview',
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: params.message }
    ],
    temperature: 0.3,
    max_tokens: 300,
  });

  const responseText = completion.choices[0].message.content || '';
  
  const targetMatch = responseText.match(/➤\s*(.*?)(?=\n|⟿|$)/);
  const nativeMatch = responseText.match(/⟿\s*(.*?)(?=\n|$)/);

  return {
    targetLanguage: targetMatch ? targetMatch[1].trim() : responseText,
    nativeLanguage: nativeMatch ? nativeMatch[1].trim() : "",
  };
};