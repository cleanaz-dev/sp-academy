
import { format, isValid } from "date-fns";

export const formatDate = (value: Date | string | null | undefined): string => {
  if (!value) return "N/A";

  const date = typeof value === "string" ? new Date(value) : value;
  if (!isValid(date)) return "N/A";

  return format(date, "MMM d, yyyy"); // e.g. "Oct 8, 2026"
};

export function vocabWordCount(vocabMoment: unknown): number {
  return Array.isArray(vocabMoment) ? vocabMoment.length : 0;
}