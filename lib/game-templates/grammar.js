// lib/game-templates/grammar.js

import GrammarDetectivePreview from "@/components/games/preview/GrammarDetectivePreview";

// Grammar Detective game template
export default {
  name: "Grammar Detective",
  slug: "grammar-detective",
  needsAudio: false,
  needsImages: false,

  createPrompt(data) {
    return `You are creating a grammar detective game in French. For each question:
1. Provide a case number and title.
2. Provide an incorrect sentence (the "crime").
3. Provide 4 multiple-choice options for the corrected version.
4. Include a clue to help solve the final mystery.
5. Include an explanation of why the corrected version is right.

For the final mystery:
1. Provide 3 distinct image prompts describing different scenes.
2. Provide a question asking: "Which image shows the criminal?"
3. Provide 4 multiple-choice answers (each corresponding to one image prompt).
4. Include an explanation of why the chosen image is correct.

Your response **must be valid JSON** with no explanations or extra text. 

JSON FORMAT:

{
  "cases": [
    {
      "caseNumber": 1,
      "caseTitle": "The Missing Verb",
      "choices": [
        "Elle va au marché",
        "Elle vais au marché",
        "Elle allez au marché",
        "Elle vont au marché"
      ],
      "correctAnswerIndex": 0,
      "explanation": "The subject 'Elle' requires the verb 'va' in the present tense.",
      "criminalClue": "Criminal is wearing blue",
      "timeLimit": 5
    }
    // ... EXPLICITY Generate 5 cases, with the correct answer at a random index (0-3).
  ],
  "finalMystery": {
    "imagePrompts": [
      "Prompt has one clue",
      "Prompt has 2 clues.",
      "One correct image prompt based on the clues"

      ***BAD IMAGE PROMPT ARE PROMPTS WITH ANY NEGATIVES LIKE "NO" OR "WITHOUT" OR "LEFT" OR "RIGHT"*** 
     
    ],
    "question": "Which image shows the criminal?",
    "choices": [
      "Image 1",
      "Image 2",
      "Image 3",
    ],
    "correctAnswerIndex": [correct image index],
    "explanation": "Explain how the clues given support the correc answer."
  }

  IMPORTANT: THE CLUES MUST BE RELEVANT TO THE CRIMINAL AND CAN BE USED TO DETERMINE THE CORRECT ANSWER IN THE FINAL MYSTERY.

  }
}
    
  ]`;
  },

  parseResponse(responseText) {
    return JSON.parse(responseText);
  },

  postProcess(data) {
    // Add any grammar-specific formatting
    return data;
  },

  previewComponent: GrammarDetectivePreview,
};
