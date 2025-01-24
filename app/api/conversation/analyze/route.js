// app/api/conversation/analyze/route.js
import { NextResponse } from "next/server";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// Function to get analysis from Claude
async function getConversationAnalysis(history) {
  const client = new BedrockRuntimeClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const analysisPrompt = {
    prompt: `\n\nHuman: You are a French language tutor. Please analyze this conversation history and provide detailed feedback:

${history.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Please analyze:
1. Vocabulary Used Successfully
2. Grammar Points Demonstrated
3. Areas for Improvement
4. Suggestions for Practice
5. OUTPUT ONLY JSON FORMAT THAT CAN BE USED AS JSON.

Provide the analysis in this exact JSON structure:
{
  "vocabularyUsed": ["word1", "word2"],
  "grammarPoints": ["point1", "point2"],
  "improvements": ["area1", "area2"],
  "practiceAdvice": "specific advice"
}

DO NOT INCLUDE ANY EXPLANATORY TEXT. RETURN ONLY JSON. INVALID OUTPUT WILL BE REJECTED.
NO SAPCES BEFORE RESPONSE.

\n\nAssistant:`,
    max_tokens_to_sample: 500,
    temperature: 0.7,
  };

  const command = new InvokeModelCommand({
    modelId: "anthropic.claude-v2:1",
    body: JSON.stringify(analysisPrompt),
    contentType: "application/json",
  });

  const response = await client.send(command);

    const responseData = JSON.parse(new TextDecoder().decode(response.body));
  return JSON.parse(responseData.completion);
}

export async function POST(req) {
  try {
    const { userId } = auth();
    const { history } = await req.json();
    
    // Get analysis from Claude
    const analysis = await getConversationAnalysis(history);

    const user = await prisma.user.findFirst({
      where: { userId }
    })
  

    // Save to database
    await prisma.conversationRecord.create({
      data: {
        user: {
          connect: {
            id: user.id
          }
        },
        dialogue: history,
        analysis // This will be structured JSON
      }
    });

    return NextResponse.json({
      analysis: analysis.completion
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze conversation' },
      { status: 500 }
    );
  }
}