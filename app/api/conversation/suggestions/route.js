// app/api/conversation/suggestions/route.js
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req) {
  try {
    const { history } = await req.json();

    const formattedHistory = history
      .map(msg => `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`)
      .join('\n');

      console.log("Formatted history:", formattedHistory);

      const message = await anthropic.messages.create({
        model: "claude-3-opus-latest",
        max_tokens: 150,
        temperature: 0.7,
        system: `You are a French language tutor for beginners. Based on the conversation history, suggest exactly 2 natural French responses that the student could use to continue the conversation. Each suggestion must be in the format 'French|English', with no additional text or introductions. Separate the suggestions with newlines. Do not include any explanations or extra information.`,
        messages: [
          {
            role: "user",
            content: `Here's the conversation history:\n${formattedHistory}\n\n`
          }
        ]
      });
      

    console.log("Message content:", message.content[0].text);

    // Parse the response to get suggestions with translations
    const suggestions = message.content[0].text
      .split('\n')
      .filter(suggestion => suggestion.trim())
      .slice(0, 2)
      .map(suggestion => {
        const [french, english] = suggestion.split('|').map(s => s.trim());
        return { french, english };
      });

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Suggestions API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}
