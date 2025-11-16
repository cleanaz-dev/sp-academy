import { moonshotAPI } from '../client';
import { getUserScorePrompt } from '../prompts/get-user-score';
import type { ScoringParams, UserScore } from '../types';

export const getUserScore = async (params: ScoringParams): Promise<UserScore> => {
  const prompt = getUserScorePrompt(params);
  
  const completion = await moonshotAPI.chat.completions.create({
    model: 'kimi-k2-turbo-preview',
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: params.userMessage }
    ],
    temperature: 0.3,
    max_tokens: 500,
  });

  const responseText = completion.choices[0].message.content || '';
  
  // Move your scoring parsing logic here from the old route
  const scoreMatch = responseText.match(/Score:\s*(\d+)/);
  const explanationMatch = responseText.match(/Explanation:\s*(.*?)(?=\n|$)/);
  const improvedMatch = responseText.match(/Improved Response:\s*(.*?)(?=\n|$)/);

  const score = scoreMatch ? parseInt(scoreMatch[1], 10) : null;
  const explanation = explanationMatch ? explanationMatch[1].trim() : "No explanation provided.";
  const improvedResponse = improvedMatch ? improvedMatch[1].trim() : "No improvement needed.";

  // Your label logic
  let label = "OK";
  if (score && score >= 9) label = "Excellent";
  else if (score && score >= 7) label = "Great";
  else if (score && score >= 5) label = "Good";
  else if (score && score >= 3) label = "OK";
  else label = "Poor";

  const shouldSuggest = score !== null && score <= 6 && improvedResponse !== "No improvement needed.";

  return {
    score,
    label,
    explanation,
    improvedResponse: shouldSuggest ? improvedResponse : null,
    corrections: null // You can add the corrections parsing logic here later
  };
};