
import { moonshotAPI } from "../client";

export async function generateStory(formData: FormData) {
  try {
    const topic = formData.get("topic");
    const difficulty = formData.get("difficulty");
    const paragraphs = formData.get("paragraphs");
    const genre = formData.get("genre");
    const grammar = formData.get("grammar");
    const learningObjectives = formData.get("learningObjectives");

    // Validation
    if (
      !topic ||
      !difficulty ||
      !paragraphs ||
      !genre ||
      !grammar ||
      !learningObjectives
    ) {
      return { success: false, error: "Missing required fields" };
    }

    const prompt = `Generate a ${genre} story in French with exactly ${paragraphs} paragraphs for ${difficulty} level students about ${topic}. And create a title for it in French.

    Story Requirements:
    - Use primarily ${grammar} tense/mood throughout the story
    - Maintain the ${genre} genre conventions and style
    - Include natural examples of ${grammar} usage
    - Ensure the story is appropriate for ${difficulty} level students
    - Ensure ${learningObjectives} are applied to story
    - Include 5-15 relevant vocabulary words, prioritizing words related to the ${topic} and ${genre}
    - Include 5-15 relevant grammar highlights, prioritizing words related to the ${topic} and ${genre}
    - Create a title for the story
    
    Respond with ONLY a JSON object in the following format, no additional text:
    {
      "title": "Your title here",
      "frenchText": "Your French story here",
      "englishText": "Your English translation here",
      "vocabulary": [
        {"french": "word1", "english": "translation1", "grammarType": "verb/noun/adjective"}
      ],
      "grammarHighlights": [
        {"expression": "French expression", "explanation": "How it demonstrates ${grammar}"}
      ]
    }`;

    const completion = await moonshotAPI.chat.completions.create({
      model: "kimi-k2-turbo-preview",
      max_tokens: 2000,
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