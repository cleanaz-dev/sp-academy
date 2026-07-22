import { z } from "zod";

export const DuckAWearSchema = z.object({
  gameTitle: z.string(),
  rounds: z.array(
    z.object({
      imageUrl: z.string(),
      targetColors: z.array(z.string()),
      targetClothes: z.array(z.string()),
    })
  )
});

export type DuckAWearData = z.infer<typeof DuckAWearSchema>;