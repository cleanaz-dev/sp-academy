import { z } from "zod";

export const pictureGameSchema = z.object({
  gameTitle: z.string().describe("Game title in the target language"),
  rounds: z.array(
    z.object({
      // Target Language (What the player MUST speak in)
      targetColors: z
        .array(z.string())
        .describe("Target language color names (e.g., 'jaune', 'rouge' for French)"),
      targetClothes: z
        .array(z.string())
        .describe("Target language clothing items (e.g., 'maillot de bain' for French)"),

      // Native Language (UI hints for the player)
      nativeColors: z
        .array(z.string())
        .describe("Native language color names (e.g., 'yellow', 'red' for English)"),
      nativeClothes: z
        .array(z.string())
        .describe("Native language clothing items (e.g., 'swimsuit' for English)"),

      // Image generation prompt (ALWAYS ENGLISH)
      imagePrompt: z
        .string()
        .describe("ALWAYS IN ENGLISH: [Use Reference Image for character style] A cute cartoon duck wearing..."),
      
      imageUrl: z.string().optional()
    })
  )
});

export type PictureGameData = z.infer<typeof pictureGameSchema>;