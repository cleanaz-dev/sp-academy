// components/sprite/sprite-chat-utils.ts
import type { UIMessage } from "ai";
import type {
  SpriteTurn,
  ContextCardData,
  SpriteAction,
} from "@/lib/schema/sprite-schema";

export type ActiveTab = "stage" | "briefing" | "sessions";

export interface ChatContextData {
  userName: string;
  nativeLang: string;
  targetLang: string;
  currentLessonTitle: string;
  topWord?: { word: string; translation?: string | null; avgSpokenScore?: number | null } | null;
  topPhrase?: { word: string; translation?: string | null; avgSpokenScore?: number | null } | null;
  recentWords?: { word: string; translation?: string | null; status: string }[] | null;
  avgPronunciation: number;
}

export interface ParsedPayload {
  spokenText: string;
  translation?: string | null;
  contextCard?: ContextCardData | null;
  action?: SpriteAction | null;
}

export interface UIMessageTurn {
  id: string;
  userMessage?: UIMessage;
  assistantMessage?: UIMessage;
}

export function cleanDisplayString(str: string): string {
  return str
    .replace(/[«»]/g, '"')
    .replace(/""+/g, '"')
    .trim();
}

export function getRawText(m?: UIMessage): string {
  if (!m) return "";
  return m.parts
    .filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
    .map((p) => p.text)
    .join("");
}

export function parseMessagePayload(m?: UIMessage): ParsedPayload {
  const raw = getRawText(m);
  if (!raw) return { spokenText: "" };

  const [spokenPart, jsonPart] = raw.split("---JSON---");
  const spokenText = cleanDisplayString(spokenPart || "");

  if (!jsonPart) {
    return { spokenText };
  }

  try {
    const parsed = JSON.parse(jsonPart.trim());
    const translation = parsed.translation ? cleanDisplayString(String(parsed.translation)) : null;
    return {
      spokenText: spokenText || translation || "",
      translation: spokenText ? translation : null,
      contextCard: parsed.contextCard || null,
      action: parsed.action || null,
    };
  } catch {
    return { spokenText };
  }
}

export function turnsToUIMessages(
  turns: (SpriteTurn & { translation?: string | null })[]
): UIMessage[] {
  const msgs: UIMessage[] = [];
  for (const t of turns) {
    msgs.push({
      id: `${t.id}-user`,
      role: "user",
      parts: [{ type: "text", text: cleanDisplayString(t.userPrompt) }],
    });

    const hasJson = t.translation || t.contextCard || t.action;
    const rawAssistantText = hasJson
      ? `${cleanDisplayString(t.assistantReply)}\n---JSON---\n${JSON.stringify({
          translation: t.translation ?? null,
          contextCard: t.contextCard ?? null,
          action: t.action ?? null,
        })}`
      : cleanDisplayString(t.assistantReply);

    msgs.push({
      id: `${t.id}-assistant`,
      role: "assistant",
      parts: [{ type: "text", text: rawAssistantText }],
    });
  }
  return msgs;
}

export function groupUIMessagesIntoTurns(messages: UIMessage[]): UIMessageTurn[] {
  const turns: UIMessageTurn[] = [];
  for (const msg of messages) {
    if (msg.role === "user") {
      turns.push({ id: msg.id, userMessage: msg });
    } else if (msg.role === "assistant") {
      const lastTurn = turns[turns.length - 1];
      if (lastTurn && !lastTurn.assistantMessage) {
        lastTurn.assistantMessage = msg;
      } else {
        turns.push({ id: msg.id, assistantMessage: msg });
      }
    }
  }
  return turns;
}