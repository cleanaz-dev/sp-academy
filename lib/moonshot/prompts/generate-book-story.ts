import { moonshotAPI } from "../client";

const languageNames: Record<string, string> = {
  en: "English",
  fr: "French",
  es: "Spanish",
};

const contentFocusLabels: Record<string, string> = {
  vocabulary: "Vocabulary Building",
  verbs: "Action Verbs",
  dialogue: "Dialogue/Conversation",
  mixed: "Mixed Content",
};

export interface BookGenerationRequest {
  title: string;
  topic: string;
  mainCharacter: string;
  description: string;
  difficulty: string;
  numberOfPages: number;
  genre: string;
  targetLanguage: string;
  nativeLanguage: string;
  contentFocus: string[];
}

export interface BookGenerationResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// Update your generateBookStory function
export async function generateBookStory(requestData: BookGenerationRequest): Promise<BookGenerationResponse> {
  try {
    const {
      title,
      topic,
      mainCharacter,
      description,
      difficulty,
      numberOfPages,
      genre,
      targetLanguage,
      nativeLanguage,
      contentFocus
    } = requestData;

    // Validation
    if (
      !title ||
      !topic ||
      !mainCharacter ||
      !description ||
      !difficulty ||
      !numberOfPages ||
      !genre ||
      !targetLanguage ||
      !nativeLanguage ||
      !contentFocus
    ) {
      return { success: false, error: "Missing required fields" };
    }

    const targetLangName = languageNames[targetLanguage];
    const nativeLangName = languageNames[nativeLanguage];
    
    // Build content focus description
    const focusDescriptions = contentFocus.map((focus: string) => contentFocusLabels[focus]).join(", ");

    const prompt = `Generate a ${genre} story in ${targetLangName} with exactly ${numberOfPages} pages for ${difficulty} level students.

Story Details:
- Title: "${title}"
- Topic: ${topic}
- Main Character: ${mainCharacter}
- Character Description: ${description}
- Genre: ${genre}
- Difficulty Level: ${difficulty}
- Content Focus: ${focusDescriptions}

Story Requirements:
- Write the story entirely in ${targetLangName}
- Maintain the ${genre} genre conventions and style
- Feature ${mainCharacter} as the main character with these traits: ${description}
- Make the story appropriate for ${difficulty} level language learners
- Each page should be 1-2 paragraphs (100-150 words per page)
- Use vocabulary and grammar structures appropriate for ${difficulty} level
- Make the story engaging and educational
- Include natural dialogue and descriptions
- Provide a complete ${nativeLangName} translation of the entire story

Content Focus Requirements:
${contentFocus.includes("vocabulary") ? "- Emphasize rich vocabulary building with varied word choices" : ""}
${contentFocus.includes("verbs") ? "- Include diverse action verbs and verb forms throughout the story" : ""}
${contentFocus.includes("dialogue") ? "- Include substantial dialogue and conversation between characters" : ""}
${contentFocus.includes("mixed") ? "- Use a natural mix of different language elements" : ""}

Educational Content:
- Include 10-20 relevant vocabulary words with translations to ${nativeLangName}
- Ensure vocabulary and grammar align with the selected content focus areas

Respond with ONLY a JSON object in the following format, no additional text:
{
  "title": "Story title in ${targetLangName}",
  "pages": [
    {
      "pageNumber": 1,
      "targetLanguageText": "Text in ${targetLangName}",
      "nativeLanguageText": "Translation in ${nativeLangName}"
    }
  ],
  "vocabulary": [
    {
      "word": "word in ${targetLangName}",
      "translation": "translation in ${nativeLangName}",
      "type": "noun/verb/adjective/etc",
      "example": "example sentence in ${targetLangName}"
    }
  ],
  "grammarHighlights": [
    {
      "structure": "${targetLangName} grammar structure",
      "explanation": "Explanation in ${nativeLangName}",
      "example": "Example from the story"
    }
  ]
}`;

    const completion = await moonshotAPI.chat.completions.create({
      model: "kimi-k2-turbo-preview",
      max_tokens: 10000,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const storyData = JSON.parse(completion.choices[0].message.content.trim());
    console.log(storyData);
    return { success: true, data: storyData };
  } catch (error: any) {
    console.error("Story generation error:", error);
    return { success: false, error: error.message };
  }
}