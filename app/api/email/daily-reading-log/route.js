// app/api/email/daily-reading-log/route.js
import { NextResponse } from "next/server";
import axios from "axios";
import { sendEmail } from "@/lib/resend";
import DailyReadingLogEmailTemplate from "@/components/email/DailyReadingLogEmailTemplate";

async function getNextBookRecommendation(userName, lastBookRead) {
  try {
    const response = await axios.post(
      "https://api.perplexity.ai/chat/completions",
      {
        model: "pplx-7b-online",
        messages: [
          {
            role: "system",
            content: `You are a friendly book recommendation assistant. 
            Suggest one perfect next book based on the user's recent reading.
            Provide a concise, engaging recommendation.`,
          },
          {
            role: "user",
            content: `Recommend the next great book for ${userName} 
            who recently read: ${lastBookRead}. 
            Keep the recommendation brief and exciting.`,
          },
        ],
        max_tokens: 200,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    // Parse the book recommendation
    const recommendation = JSON.parse(response.data.choices[0].message.content);
    return recommendation;
  } catch (error) {
    console.error("Error fetching book recommendation:", error);

    // Fallback recommendation
    return {
      title: "The Midnight Library",
      author: "Matt Haig",
      recommendation:
        "A beautiful story about life's possibilities and second chances.",
    };
  }
}

export async function POST(req) {
  try {
    // Parse the request body
    const body = await req.json();
    const { userName, userEmail, lastBookRead, readingStreak, encouragement } =
      body;

    // Get personalized book recommendation
    const nextBook = await getNextBookRecommendation(userName, lastBookRead);

    // Send email using Resend
    await sendEmail(
      userEmail,
      `${userName}'s Daily Reading Update 📚`,
      <DailyReadingLogEmailTemplate
        userName={userName}
        lastBookRead={lastBookRead}
        nextBook={nextBook}
        readingStreak={readingStreak}
        encouragement={encouragement}
      />,
    );

    return NextResponse.json(
      { message: "Email sent successfully!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
