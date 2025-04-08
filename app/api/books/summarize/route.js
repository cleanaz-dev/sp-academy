//api/books/summarize/route.js
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const data = await req.json();
    console.log("data:", data.text);

    const { text } = data;

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `Create a clear summary that:
  - Opens with the main topic/concept/theme
  - Highlights 2-3 essential points or key developments
  - Includes important details or examples
  - Ends with the overall significance or conclusion
  
  Present ideas in connected, well-structured sentences using appropriate transitions.
  Length: 150-175 words.
  
  Text: "${text}"
  
  Provide only the summary without additional commentary.`,
        },
      ],
    });

    console.log("response:", response.content[0].text);

    return NextResponse.json({ summary: response.content[0].text });
  } catch (error) {
    console.error("Error in summarize route:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
