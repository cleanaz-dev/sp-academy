import { GameDifficulty, Languages } from "@prisma/client";
import z from "zod";

export const gameVariationTaskMetaSchema = z.object({
    gameId: z.string(),
    gameVariationId: z.string(),
    targetLanguage: z.enum(Languages),
    nativeLanguage: z.enum(Languages),
    difficulty: z.enum(GameDifficulty),
    variation: z.string()
});

export type GameVariationTaskMeta = z.infer<typeof gameVariationTaskMetaSchema>