//app/api/lessons/lecture/create/route.js
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import {
  createImagesForLecture,
  createMainImageForLecture,
} from "@/lib/replicate";
import {
  createLecturePrompt,
  createLanguageLecturePrompt,
} from "@/lib/claudePrompts";

export async function POST(request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const data = await request.json();
    console.log("Data from create lecture API:", data);

    const {
      title,
      level,
      subject,
      topic,
      objectives,
      generateImage,
      createQuiz,
      questionCount,
      isMultipleChoice,
    } = data;

    const objectivesString = objectives.join(", ");
    console.log("Objectives as String:", objectivesString);

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // First, let's create a better message structure
    const message = `Create a lesson with the following details:
    Title: "${title}"
    Topic: "${topic}"
    Grade Level: "${level}"
    Subject: "${subject}"
    Focus Area: "${objectivesString}"
    Target Age Group: ${getAgeGroup(level)}
    Complexity Level: ${getComplexityLevel(level)}`;

    // Utility to extract the grade number from level input
    function getGradeNumber(level) {
      let gradeNum;
      if (typeof level === "string") {
        // Try to extract any digit(s) from the string
        const match = level.match(/\d+/);
        if (match) {
          gradeNum = parseInt(match[0], 10);
        }
      } else if (typeof level === "number") {
        gradeNum = level;
      }
      return isNaN(gradeNum) ? null : gradeNum;
    }

    function getAgeGroup(level) {
      const gradeNum = getGradeNumber(level);
      const mapping = {
        1: "6-7 years",
        2: "7-8 years",
        3: "8-9 years",
        4: "9-10 years",
        5: "10-11 years",
        6: "11-12 years",
        7: "12-13 years",
        8: "13-14 years",
        9: "14-15 years",
        10: "15-16 years",
        11: "16-17 years",
        12: "17-18 years",
      };
      return gradeNum && mapping[gradeNum] ? mapping[gradeNum] : "Adult";
    }

    function getComplexityLevel(level) {
      const gradeNum = getGradeNumber(level);
      if (gradeNum) {
        if (gradeNum <= 3) return "Basic";
        if (gradeNum <= 6) return "Elementary";
        if (gradeNum <= 8) return "Intermediate";
        if (gradeNum <= 12) return "Advanced";
      }
      return "Professional";
    }

    // Extract image prompts from the response text
    function extractImagePrompts(responseText) {
      // Regular expression to match [IMAGE-X] and the following Image Prompt line
      const imagePromptRegex = /\[IMAGE-\d+\]\nImage Prompt: "(.*?)"/g;

      const imagePrompts = [];
      let match;

      // Find all matches
      while ((match = imagePromptRegex.exec(responseText)) !== null) {
        imagePrompts.push({
          marker: match[0].split("]")[0] + "]", // Gets the [IMAGE-X] part
          prompt: match[1], // Gets the actual prompt text
        });
      }

      return imagePrompts;
    }
    // Replace image markers with actual image URLs
    function replaceImageMarkers(responseText, imageUrls) {
      let updatedText = responseText;

      imageUrls.forEach((url, index) => {
        // Escape special characters and make the pattern more specific
        const marker = `\\[IMAGE-${index + 1}\\]\\nImage Prompt: ".*?"`;
        updatedText = updatedText.replace(
          new RegExp(marker, "gs"),
          `![image-${index + 1}](${url})`
        );
      });

      return updatedText;
    }

    // Modified system prompt
    function selectPrompt(data) {
      if (data.subject === "Language") {
        return createLanguageLecturePrompt();
      } else {
        return createLecturePrompt({});
      }
    }
    const systemPrompt = selectPrompt(data);

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 8000,
      system: systemPrompt,
      messages: [{ role: "user", content: message }],
      temperature: 0.7,
    });

    const responseText = response.content[0].text;
    console.log("response text:", responseText);

    function extractNextLesson(lessonText) {
      const regex = /<<NEXT_LESSON>>\s*(.*?)\s*<<<NEXT_LESSON>>/s;
      const match = lessonText.match(regex);
      if (match && match[1]) {
        return match[1].trim(); // Extracted next lesson content
      }
      return null; // If no match is found
    }
    const nextLesson = extractNextLesson(responseText);

    // Extract image prompts
    const imagePrompts = extractImagePrompts(responseText);

    console.log("Extracted Image Prompts:", imagePrompts);

    // Generate images for each prompt
    const imageUrls = [];
    for (const [index, { prompt }] of imagePrompts.entries()) {
      if (index === 0) {
        // For the first prompt, use the main image function
        const mainImageUrl = await createMainImageForLecture(prompt);
        imageUrls.push(mainImageUrl);
      } else {
        // For the rest, use the other images function
        const imageUrl = await createImagesForLecture(prompt);
        imageUrls.push(imageUrl);
      }
    }

    // Replace markers with generated image URLs
    const finalContent = replaceImageMarkers(responseText, imageUrls);

    const imageDataSet = {
      images: imageUrls,
      prompts: imagePrompts,
    };

    console.log("Image data set:", imageDataSet);

    return NextResponse.json({
      success: true,
      responseText: finalContent,
      nextLesson: nextLesson,
    });
  } catch (error) {
    console.error("Error creating lesson:", error);
    return new NextResponse("Error creating lesson", { status: 500 });
  }
}
