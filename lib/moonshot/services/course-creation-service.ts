import { moonshotAPI } from '../client';
import type { CourseCreationParams } from '../types';

export const createCourse = async (params: CourseCreationParams ) => {
  const prompt = params.prompt


    const completion = await moonshotAPI.chat.completions.create({
      model: 'kimi-k2-turbo-preview',
      messages: [
        { role: 'system', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    const responseText = completion.choices[0].message.content || '';

    return {
      response: responseText || ""
    }
} 