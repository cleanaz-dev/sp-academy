import { z } from "zod";

export const createReadingLogSchema = (totalPages: number) =>
  z
    .object({
      startPage: z.number().min(1, "Start page must be at least 1"),
      endPage: z.number().min(1, "End page must be at least 1"),
      summary: z
        .string()
        .min(50, "Summary must be at least 50 characters long"),
      bookId: z.string(),
      userId: z.string(),
    })
    .refine((data) => data.startPage <= data.endPage, {
      message: "Start page must be less than or equal to end page",
      path: ["startPage"],
    })
    .refine((data) => data.endPage <= totalPages, {
      message: `End page cannot exceed total pages (${totalPages})`,
      path: ["endPage"],
    });