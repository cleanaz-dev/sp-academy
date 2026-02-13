import { replicate } from "../config/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface SuggestionParams {
  history: Message[];
  targetLanguage: string;
  nativeLanguage: string;
}

export async function generateSuggestions({
  history,
  targetLanguage,
  nativeLanguage,
}: SuggestionParams) {
  
  // 1. Context Management: Only take the last 6 messages. 
  // Your logs showed the entire conversation history repeated 3 times.
  // This confuses the LLM.
  const recentHistory = history.slice(-6);

  const formattedHistory = recentHistory
    .map(
      (msg) =>
        `${msg.role === "user" ? "Human" : "Assistant"}: ${msg.content}`,
    )
    .join("\n");

  const systemPrompt = `You are a ${targetLanguage} language tutor.
Provide EXACTLY 2 natural responses as the USER/HUMAN based on the last question.

REQUIRED FORMAT:
Response in ${targetLanguage} ||| Translation in ${nativeLanguage}

RULES:
- Do not add bullet points or numbers.
- Keep the target language and translation on the SAME LINE if possible.
- The separator ||| is strict.
`;

  const combinedPrompt = `${systemPrompt}

--- CONVERSATION HISTORY ---
${formattedHistory}
--- END HISTORY ---

Based on the Assistant's last message, provide 2 distinct responses for the Human:`;

  try {
    const output = await replicate.run("openai/gpt-5-mini", {
      input: {
        prompt: combinedPrompt,
        max_tokens: 200, 
        temperature: 0.7,
      },
    }) as string | string[] | { text?: string; output?: string };

    let responseText = "";
    if (typeof output === "string") {
      responseText = output;
    } else if (Array.isArray(output)) {
      responseText = output.join("");
    } else if (typeof output === "object" && output !== null) {
      responseText = output.text || output.output || JSON.stringify(output);
    }

    console.log("Raw Response:", responseText);

    // --- FIX IS HERE ---
    // 1. Normalize newlines: Remove newlines appearing immediately before |||
    // 2. Remove markdown bolding (**) if the model adds it
    const cleanText = responseText
      .replace(/[\r\n]+\s*\|\|\|/g, " |||") 
      .replace(/\*\*/g, "");

    const suggestions = cleanText
      .split("\n")
      .map(line => line.trim())
      .filter((line) => line.includes("|||") && line.length > 10) // Filter empty lines
      .slice(0, 2)
      .map((suggestion) => {
        const parts = suggestion.split("|||");
        // Handle case where split results in more than 2 parts (rare)
        const targetText = parts[0];
        const nativeText = parts.slice(1).join(" "); // Join rest in case of extra pipes
        
        return {
          targetLanguage: targetText?.trim() || "",
          nativeLanguage: nativeText?.trim() || "",
        };
      });

    return suggestions;
  } catch (error) {
    console.error("Replicate API error:", error);
    return [];
  }
}