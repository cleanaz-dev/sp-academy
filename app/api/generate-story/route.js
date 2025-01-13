// app/api/generate-story/route.js
import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export async function POST(request) {
  try {
    const { topic, difficulty, paragraphs } = await request.json();

    // Validate inputs
    if (!topic || !difficulty || !paragraphs) {
      return Response.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Validate difficulty
    const validDifficulties = ['beginner', 'intermediate', 'advanced'];
    if (!validDifficulties.includes(difficulty.toLowerCase())) {
      return Response.json({ 
        success: false, 
        error: 'Invalid difficulty level' 
      }, { status: 400 });
    }

    // Validate paragraphs
    const numParagraphs = parseInt(paragraphs);
    if (isNaN(numParagraphs) || numParagraphs < 1 || numParagraphs > 5) {
      return Response.json({ 
        success: false, 
        error: 'Paragraphs must be between 1 and 5' 
      }, { status: 400 });
    }

    const prompt = `Generate a short story in French with exactly ${paragraphs} paragraphs for ${difficulty} level students about ${topic}. And create a title for it in French.
    
    Respond with ONLY a JSON object in the following format, no additional text:
    {
      "title":"Your title",
      "frenchText": "Your French story here",
      "englishText": "Your English translation here",
      "vocabulary": [
        {"french": "word1", "english": "translation1"},
        {"french": "word2", "english": "translation2"},
        {"french": "word3", "english": "translation3"},
        {"french": "word4", "english": "translation4"},
        {"french": "word5", "english": "translation5"}
      ]
    }`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-latest',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: prompt
      }],
      temperature: 0.7
    });

    // Extract the JSON string from the response
    const jsonString = response.content[0].text.trim();
    
    // Parse the JSON
    const storyData = JSON.parse(jsonString);

    return Response.json({ 
      success: true, 
      data: storyData
    });
  } catch (error) {
    console.error('Story generation error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}