// app/api/mock/generate-lesson/route.js
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { promptData } from "@/lib/constants";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, // Set in .env.local
});

// Generate prompt for Language subject lectures
// function generateLectureLanguagePrompt(data) {
//   const {
//     title,
//     subject,
//     language,
//     level,
//     objectives,
//     generateImage = true,
//   } = data;

//   return `
// You are an expert language educator creating a complete, engaging lesson titled "${title}" for ${level} ${language} learners.
// The subject is ${subject}, and the key objectives are: ${objectives.join(", ")}.

// TASK: Use your expertise to determine which components and sections will be most effective for teaching this specific topic. Create a comprehensive lecture structured as Markdown with custom components, tailored to teaching ${language}.

// AVAILABLE COMPONENTS:
// You may choose from the following component types based on what best serves this lesson:

// 1. [topic] - For introducing concepts with bilingual text
//    Format: [topic]{"french": "text in French", "english": "text in English"}

// 2. [vocab] - For presenting vocabulary lists
//    Format: [vocab]{"title": {"french": "title", "english": "title"}, "items": [{"french": "word", "english": "translation", "example": {"french": "example", "english": "translation"}}], "context": {"french": "context", "english": "context"}}

// 3. [dialogue] - For conversation examples
//    Format: [dialogue]{"title": {"french": "title", "english": "title"}, "lines": [{"speaker": "Name", "french": "text", "english": "text"}], "analysis": {"french": "analysis", "english": "analysis"}}

// 4. [pronunciation] - For pronunciation practice
//    Format: [pronunciation]{"title": {"french": "title", "english": "title"}, "items": [{"targetText": "text to pronounce"}]}

// 5. [conjugationTable] - For verb conjugations
//    Format: [conjugationTable]{"title": {"french": "title", "english": "title"}, "tense": "tense", "conjugations": [{"pronoun": "pronoun", "conjugation": "conjugated form"}]}

// 6. [flashcard] - For practice scenarios or quick review
//    Format: [flashcard]{"front": "question or prompt", "back": "answer or response"}

// 7. [info] - For important cultural or linguistic information
//    Format: [info]{"content": "Important information to highlight"}

// 8. [exercise] - For simple in-lesson exercises
//    Format: [exercise]{"instruction": "what to do", "items": ["item1", "item2"], "answers": ["answer1", "answer2"]}

// 9. [audio] - For listening examples (theoretical for this lesson)
//    Format: [audio]{"title": "title", "description": "what learners will hear"}

// 10. [generatedImage] - For visual aids
//     Format: [generatedImage]{"prompt": "description of desired image"}

// LESSON STRUCTURE:
// Your lesson should include:
// 1. An introduction in regular Markdown (2-3 paragraphs)
// 2. Main content sections with appropriate headings (## Section Title)
// 3. A logical progression of learning components
// 4. A conclusion summarizing key points

// REQUIREMENTS:
// - Choose at least 5 different component types that best serve the learning objectives
// - Include at least 7-8 total components throughout the lesson
// - Ensure a good mix of explanation, example, and practice
// - Follow a logical learning progression
// - Keep content appropriate for ${level} level learners
// - Include cultural context where relevant
// - Format all components precisely using the syntax shown above
// - Create enough content for a 30-minute lesson

// Use your judgment to decide which components will most effectively teach the topic "${title}" to ${level} ${language} learners focusing on ${objectives.join(", ")}.
// `;
// }
export async function POST(req) {
  try {
    const { data } = await req.json();

    return NextResponse.json(
      {
        lecture: promptData,
        exercises: [],
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing the request" },
      { status: 500 },
    );
  }
}

// const {
//   title = "Basic Greetings",
//   subject = "Language",
//   language = "French",
//   level = "Novice",
//   type = "Lesson",
//   courseId = "unknown",
//   objectives = ["Learn key concepts"],
//   includeLecture = true,
//   includeExercise = true,
//   generateImage = true,
//   exercises = {},
// } = data;

// let lecture = "";
// if (includeLecture && subject === "Language") {
//   const prompt = generateLectureLanguagePrompt(data);
//   try {
//     const response = await anthropic.messages.create({
//       model: "claude-3-7-sonnet-latest",
//       max_tokens: 8000,
//       messages: [{ role: "user", content: prompt }],
//     });
//     lecture = response.content[0].text;
//     console.log("lecture data:", lecture);
//   } catch (error) {
//     console.error("Error generating lecture content:", error);
//     return NextResponse.json({ error: "Failed to generate lecture content" }, { status: 500 });
//   }
// }
