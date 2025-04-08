// api/email/generate-design/route.js
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        /* Add your base email styles here */
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { /* Header styles */ }
        .content { /* Content styles */ }
        .footer { /* Footer styles */ }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            {header}
        </div>
        <div class="content">
            {{emailContent}}
        </div>
        <div class="footer">
            Spoon Fed Academy
        </div>
    </div>
</body>
</html>
`;

export async function POST(req) {
  try {
    const { content, subject } = await req.json();

    if (!content || !subject) {
      return NextResponse.json(
        { error: "Content and subject are required" },
        { status: 400 },
      );
    }

    const prompt = `You are an email design expert. Use this exact base template structure and enhance it with professional styling:

${EMAIL_TEMPLATE}

Create a professional, responsive HTML email design for:
Subject: "${subject}"
Content: "${content}"


MUST HAVE SECTION {{emailContent}} where the content will be inserted.
EXPLICIT RULE: ONLY OUTPUT HTML CODE IN THE RESPONSE`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1000,
      temperature: 0.7,
      messages: [{ role: "user", content: prompt }],
    });

    const generatedHtml = response.content[0].text.trim();

    // Basic validation of generated HTML
    if (
      !generatedHtml.includes("<!DOCTYPE html>") ||
      !generatedHtml.includes("<body")
    ) {
      throw new Error("Invalid HTML generated");
    }

    return NextResponse.json({
      design: generatedHtml,
      status: "success",
    });
  } catch (error) {
    console.error("Error generating email design:", error);
    return NextResponse.json(
      {
        error: "Failed to generate email design",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
