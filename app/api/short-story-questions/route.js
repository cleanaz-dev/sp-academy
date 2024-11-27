import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(reqeust) {
  try {

    const data = await reqeust.json();
    

    const { name, userId, storyId, englishText, phoneNumber } = data

   const response = await axios.post(
      "https://api.bland.ai/v1/calls",
      {
        phone_number: `${phoneNumber}`,
        from: "+14372920555",
        task: `Your name is Jeanne, a french teacher assistant at SP Academy. You're calling students to ask them questions based on a story, like a verbal quiz. You must ask 4 questions only.

      4 Rules to follow
      - Always ask 4 questions
      - Always wait for student to answer the question before asking next question
      - Understand that the pronounciation might not be perfect since its kids learning,if it sounds similar its correct
      - At the end of the questions, let the student know how well they did
      
      Here are the details:
      Student Name: ${name}
      Level: Beginner

      Story: ${englishText}
      
      `,
        model: "enhanced",
        language: "fr",
        voice: "nat",
        voice_settings: {},
        pathway_id: null,
        local_dialing: false,
        max_duration: 12,
        answered_by_enabled: false,
        wait_for_greeting: true,
        record: true,
        amd: false,
        interruption_threshold: 130,
        voicemail_message: null,
        temperature: null,
        transfer_phone_number: null,
        transfer_list: {},
        metadata: {
          userId: `${userId}`,
          storyId: `${storyId}`,
        },
        pronunciation_guide: [],
        start_time: null,
        request_data: {},
        tools: [],
        dynamic_data: [],
        analysis_preset: null,
        analysis_schema: {
          "correct_answers": "int",
          "incorrect_answers": "int",
          "first_questions": "string",
          "second_questions": "string",
          "third_questions": "string",
          "fourth_questions": "string",
          "first_answer": "string",
          "second_answer": "string",
          "third_answer": "string",
          "fourth_answer": "string",
        },
        webhook: "https://sp-academy.vercel.app/api/short-story-questions/response",
      },
      {
        headers: {
          authorization: process.env.BLAND_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
  return NextResponse.json(
    { message: "Response sent to BlandAI" },
    { status: 200 }
  );
} catch (error) {
    console.error("Error generating story:", error);
    return new NextResponse(
      JSON.stringify({ message: "Error generating story" }),
      { status: 500 }
    );
  }
}

export async function GET(request) {
  return new NextResponse("hello from journal api");
}
