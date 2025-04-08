// app/api/speak/lesson/route.js
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

// Initialize Anthropic with the server-side flag
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const { content, question, sectionId, history } = await request.json();

    const language = "French";

    if (!content || !question) {
      return NextResponse.json(
        { error: "Missing content or question" },
        { status: 400 },
      );
    }

    // Try to parse the content if it's a string representation of JSON
    let parsedContent = content;
    try {
      if (
        typeof content === "string" &&
        (content.startsWith("{") || content.startsWith("["))
      ) {
        parsedContent = JSON.parse(content);
      }
    } catch (e) {
      // If parsing fails, use the original content string
      console.log("Content parsing failed, using raw string");
    }

    // Format the content for Claude to better understand what we're asking about
    const formattedContent =
      typeof parsedContent === "object"
        ? JSON.stringify(parsedContent, null, 2)
        : parsedContent;

    // Updated prompt to explicitly request Markdown
    const prompt1 = `You are a ${language} language tutor assistant embedded in a lesson. The user is viewing a specific section. Be conversational but keep responses short and consice.  Respond in ${language} Level: Beginner 

Your response should be **short 1-1.5 sentences max. focused, and engaging**—like a tutor giving a quick, helpful answer. **DO NOT** summarize or repeat the section unless absolutely necessary.  

--- CURRENT SECTION (for reference only) ---  
${formattedContent}  
--- END OF SECTION ---  

--- CURRENT HISTORY ---  
${JSON.stringify(history, null, 2)}  
--- END OF HISTORY ---  

User question: "${question}"  

MUST FOLLOW RULES:

1. Respond using Mardown headers, list, tables but no icons
2. Answer **only** what is needed to clarify the user's question.  
3. **Do not** restate large portions of the section.  
4. Use Markdown features like **bold**, *italics*, or - lists where appropriate. 
5. Your response should be **short 1 sentences max. focused, and engaging**—like a tutor giving a quick, helpful answer. **DO NOT** summarize or repeat the section unless absolutely necessary.   

    `;

    const prompt = `
        [talking]{ "text": "Bonjour, comment vas-tu?", "language": "french", "speaker": "girl" }



        render this EXACTLY AS SHOWN, NOTHING ELSE.
   `;

    // Create a streaming response
    const stream = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      stream: true,
    });

    // Create a readable stream from the response
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === "content_block_delta" && chunk.delta.text) {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        }
      },
    });

    // Use NextResponse to return the streaming response
    return new NextResponse(readableStream, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Error in /api/speak/lesson:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}
