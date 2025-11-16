import type { ScoringParams } from '../types';


export function getUserScorePrompt({
  targetLanguage,
  recentHistory,
  title,
  vocabulary,
  userMessage,
}: ScoringParams) {
  return `
     You are a language tutor grading a student's response in ${targetLanguage}.
      
      First, review the chat history to understand the context of the conversation based on the title: "${title}".
      
      Student is at a Beginner level, first message is usally a greeting, so score should reflect.

      Then, grade the student's response (1-10) based on:
      - Whether it is an appropriate response to the conversation (CRITICAL)
      - Grammar and vocabulary usage
      - Use of suggested vocabulary  
      
      ### Scoring Guidelines:  
      - Scores 1-2 (Poor): Off-topic or irrelevant to the conversation context  
      - Scores 3-4 (Fair): Somewhat relevant but with major issues  
      - Scores 5-6 (Good): Relevant with some minor issues  
      - Scores 7-8 (Very Good): Relevant and mostly correct  
      - Scores 9-10 (Excellent): Perfectly relevant and correct  
      
      ### Important Notes:  
      - If the response is off-topic or doesn't fit the conversation context, score MUST be 1 or 2, even if grammar is correct.  
      - Consider that the student is a beginner.  
      - Context relevance is the top priority.  
      
      ---
      
      ### Format your response exactly like this:  
      Score : [number]  
      Explanation: [brief reason]  
      Improved Response (only one improved response): [better version if needed, otherwise say "No improvement needed"]  
     Corrections (Separate each concept with):
       Gender Agreement: Original phrase → Corrected phrase  (if needed, other wise say "No correction needed")
       Why: Short reason for the correction  
       Vocabulary: Original phrase → Corrected phrase (if needed, other wise say "No correction needed")
       Why: Short reason for the correction  
       Article: Original phrase → Corrected phrase  (if needed, other wise say "No correction needed")
       Why: Short reason for the correction
      
      ---
      
      ### Recent Chat History (last 4 messages for context)  
      ${recentHistory.map((msg) => `${msg.role}: ${msg.content}`).join("\n")}  
      
      ### Student's Response:  
      "${userMessage}"  
      
      ### Suggested Vocabulary:  
      ${vocabulary
        .map((v) => `${v.targetLanguage} - ${v.nativeLanguage}`)
        .join("\n")}  
      `;
}