//app/api/lessons/lecture/create/route.js
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { createImagesForLecture } from "@/lib/replicate";

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

    // Helper functions to determine appropriate parameters
    function getAgeGroup(level) {
      const levelMap = {
        "Grade 1": "6-7 years",
        "Grade 2": "7-8 years",
        "Grade 3": "8-9 years",
        "Grade 4": "9-10 years",
        "Grade 5": "10-11 years",
        "Grade 6": "11-12 years",
        "Grade 7": "12-13 years",
        "Grade 8": "13-14 years",
        "Grade 9": "14-15 years",
        "Grade 10": "15-16 years",
        "Grade 11": "16-17 years",
        "Grade 12": "17-18 years",
        College: "Adult",
        Professional: "Adult",
      };
      return levelMap[level] || "Adult";
    }

    function getComplexityLevel(level) {
      // Define complexity based on grade level
      if (level.includes("Grade")) {
        const gradeNum = parseInt(level.match(/\d+/)[0]);
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
          marker: match[0].split(']')[0] + ']', // Gets the [IMAGE-X] part
          prompt: match[1] // Gets the actual prompt text
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
        updatedText = updatedText.replace(new RegExp(marker, 'gs'), `![image-${index + 1}](${url})`);
      });
    
      return updatedText;
    }
    

    // Modified system prompt
    const systemPrompt = `You are an enthusiastic expert teacher. Create an engaging lesson with clear image prompts.

⏱️ Estimated Reading Time: [Calculate based on 200 words per minute]

# 🌟 [Engaging Title(create an engaging title)]

[IMAGE-1]
Image Prompt: "simple centered illustration of [main topic], digital art style"

## 🎯 Quick Preview
Three exciting things you'll learn today (use emojis)

## 🎬 Opening Hook
An engaging paragraph that captures attention and sets up the topic (3-4 sentences)

## 📚 Core Focus
Brief introduction to what we'll be studying today (person, place, event, or concept)

## 🔍 [First Main Subject Name]
[IMAGE-2]
Image Prompt: "[subject name]"

[Full paragraph about this subject]

### Key Features/Contributions
- Major characteristics or achievements
- Historical or cultural impact
- Specific dates and data (if applicable)

### Historical Significance/Legacy
[Paragraph about lasting influence or importance]

⭐ Fun Fact: [Related interesting fact]

## 🔍 [Second Main Subject Name]
[IMAGE-3]
Image Prompt: "[subject name]"

[Full paragraph about this subject]

### Key Features/Contributions
- Major characteristics or achievements
- Historical or cultural impact
- Specific dates and data (if applicable)

### Historical Significance/Legacy
[Paragraph about lasting influence or importance]

⭐ Fun Fact: [Related interesting fact]

## 🔍 [Third Main Subject Name]
[IMAGE-4]
Image Prompt: "[subject name]"

[Full paragraph about this subject]

### Key Features/Contributions
- Major characteristics or achievements
- Historical or cultural impact
- Specific dates and data (if applicable)

### Historical Significance/Legacy
[Paragraph about lasting influence or importance]

⭐ Fun Fact: [Related interesting fact]

## 💡 Historical Context
[Paragraph about the time period and significance]

## 📖 Key Innovations & Patents (if applicable. if none do not include this section)
[List of specific innovations with dates and patent numbers, or skip if not relevant]

## 🎯 Impact & Influence
[Concluding paragraph about collective impact]

[End of the lesson]

Ensure content:
- Uses [IMAGE-X] markers for easy extraction
- Provides detailed image prompts for AI generation
- Makes subject names the main headers
- Includes specific dates and data (where applicable)
- Balances descriptive info with achievements or significance
- Keeps focus on the main subjects throughout

IMPORTANT RULES FOR IMAGE PROMPTS:
- For [IMAGE-1]: Use "simple centered illustration of [main topic], digital art style"
- For [IMAGE-2], [IMAGE-3], [IMAGE-4]: Use ONLY the subject's name, nothing else
- JUST the name
    `;

    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-latest",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: message }],
      temperature: 0.7,
    });

    const responseText = response.content[0].text;
    console.log("response text:", responseText);

    // Extract image prompts
    const imagePrompts = extractImagePrompts(responseText);

    // Generate images for each prompt
    const imageUrls = [];
    for (const { prompt } of imagePrompts) {
      // Call your image generator for each prompt
      const imageUrl = await createImagesForLecture(prompt); // Your existing image generator function
      imageUrls.push(imageUrl);
    }

    // Replace markers with generated image URLs
    const finalContent = replaceImageMarkers(responseText, imageUrls);

    const imageDataSet = {
      images: imageUrls,
      prompts: imagePrompts,
    }

    console.log("Image data set:", imageDataSet);
        

    return NextResponse.json({
      success: true,
      responseText: finalContent,
    });
  } catch (error) {
    console.error("Error creating lesson:", error);
    return new NextResponse("Error creating lesson", { status: 500 });
  }
}
