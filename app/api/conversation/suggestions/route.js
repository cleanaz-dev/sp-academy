// app/api/conversation/suggestions/route.js
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req) {
  try {
    const { history } = await req.json();

    // Convert conversation history to a format Claude can understand
    const formattedHistory = history
      .map(msg => `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    const message = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 150,
      temperature: 0.7,
      system: "You are a French language tutor. Based on the conversation history, suggest 2 natural French responses that the student could use to continue the conversation. Keep suggestions short, appropriate and simple for the context. Provide only the French phrases, separated by newlines, without translations or additional text.",
      messages: [
        {
          role: "user",
          content: `Here's the conversation history:\n${formattedHistory}\n\nPlease suggest 2 natural French responses to continue this conversation.`
        }
      ]
    });

    // Parse the response to get individual suggestions
    const suggestions = message.content[0].text
      .split('\n')
      .filter(suggestion => suggestion.trim())
      .slice(0, 4);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Suggestions API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}