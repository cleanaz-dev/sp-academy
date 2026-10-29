// lib/sprites/sprite-chat-tool-functions.ts
import { ChalkboardSchema, type ChalkboardData } from "@/lib/schema/sprite-schema";

export interface SpriteTurnWidgets {
  isTranslationRequired: boolean;
  translation: string | null;
  chalkboard: ChalkboardData | null;
  contextCard: {
    title: string;
    grammarRule: string;
    examples: Array<{ french: string; english: string }>;
  } | null;
  action: {
    type: string;
    targetWord?: string;
  } | null;
}

/**
 * Parses and validates the ---JSON--- block from the model so malformed
 * fields never crash the UI or pollute prisma.spriteSession.turns.
 */
export function parseAndValidateSpriteWidgets(
  rawJson: string | undefined,
  stripArtifacts: (s: string) => string
): SpriteTurnWidgets {
  if (!rawJson) {
    return {
      isTranslationRequired: false,
      translation: null,
      chalkboard: null,
      contextCard: null,
      action: null,
    };
  }

  let parsed: any = {};
  try {
    const cleaned = rawJson
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    const obj = JSON.parse(cleaned);
    if (obj && typeof obj === "object") parsed = obj;
  } catch {
    parsed = {};
  }

  const translation = parsed.translation
    ? stripArtifacts(String(parsed.translation))
    : null;

  // Validate Chalkboard with Zod so partial/bad JSON degrades gracefully to null
  let chalkboard: ChalkboardData | null = null;
  if (parsed.chalkboard) {
    const cbResult = ChalkboardSchema.safeParse(parsed.chalkboard);
    if (cbResult.success) {
      chalkboard = cbResult.data;
    }
  }

  return {
    isTranslationRequired: Boolean(translation),
    translation,
    chalkboard,
    contextCard: parsed.contextCard ?? null,
    action: parsed.action ?? null,
  };
}