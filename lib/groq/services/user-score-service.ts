import { groq, GROQ_MODELS } from '@/lib/groq';
import { userScoreSchema } from "../schemas/user-score-schema";
import { ScoringParams, UserScore } from "../types";


function getUserScorePrompt({
  targetLanguage,
  recentHistory,
  title,
  vocabulary,
  userMessage,
}: ScoringParams) {
  return `You are a language tutor grading a student's response in ${targetLanguage}.

Student is at a Beginner level. First message is usually a greeting, so score should reflect that.

Review the chat history to understand the context based on the title: "${title}"

Grade the student's response (1-10) based on:
- Whether it is an appropriate response to the conversation (CRITICAL)
- Grammar and vocabulary usage
- Use of suggested vocabulary

### Scoring Guidelines:
- 1-2 (Poor): Off-topic or irrelevant to conversation
- 3-4 (OK): Somewhat relevant but with major issues
- 5-6 (Good): Relevant with some minor issues
- 7-8 (Great): Relevant and mostly correct
- 9-10 (Excellent): Perfectly relevant and correct

### Label Assignment:
- Score 9-10 → "Excellent"
- Score 7-8 → "Great"
- Score 5-6 → "Good"
- Score 3-4 → "OK"
- Score 1-2 → "Poor"

### Important:
- If response is off-topic, score MUST be 1-2, even if grammar is correct
- Context relevance is the top priority
- Only provide improvedResponse if score is 6 or below AND improvement is genuinely needed

### Recent Chat History:
${recentHistory.map((msg) => `${msg.role}: ${msg.content}`).join("\n")}

### Student's Response:
"${userMessage}"

### Suggested Vocabulary:
${vocabulary.map((v) => `${v.targetLanguage} - ${v.nativeLanguage}`).join("\n")}

OUTPUT IN JSON SCHEMA with score, label, improvedResponse (null if not needed)`;
}

export const getUserScoreNew = async (params: ScoringParams): Promise<UserScore> => {
  const prompt = getUserScorePrompt(params);
  
  const completion = await groq.chat.completions.create({
    model: GROQ_MODELS.GPT_OSS_120B,
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: params.userMessage }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "user_scoring",
        strict: true,
        schema: userScoreSchema
      },
    },
    temperature: 0.3,
    max_tokens: 750,
  });

  const content = completion.choices[0].message.content;
  
  if (!content) throw new Error("No scoring response");

  const parsed = JSON.parse(content);
  console.log("Parsed user score:", parsed);

  return {
    score: parsed.score,
    label: parsed.label,
    explanation: parsed.explanation,
    improvedResponse: parsed.improvedResponse,
    corrections: parsed.corrections,
  };
};