import { z } from "zod";

export const createBookReportSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  genre: z.string().min(1, "Genre is required"),
  language: z.string().min(1, "Language is required"),
  pages: z.coerce.number().int().positive("Pages must be a positive number"),
  description: z.string().min(1, "Description is required"),
  coverUrl: z.string().url("Cover URL must be a valid URL"),
});

export type CreateBookReportInput = z.infer<typeof createBookReportSchema>;