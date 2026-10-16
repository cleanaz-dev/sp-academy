// lib/languages.ts
export const LANGUAGE_CODES = {
  ENGLISH: "en-US",
  FRENCH: "fr-FR",
  SPANISH: "es-ES",
  GERMAN: "de-DE",
  ITALIAN: "it-IT",
  PORTUGUESE: "pt-BR",
  JAPANESE: "ja-JP",
  KOREAN: "ko-KR",
  CHINESE: "zh-CN",
} as const;

export type LanguageName = keyof typeof LANGUAGE_CODES;

export function toLanguageCode(language: string): string {
  const value = language.trim();

  // Already a code like "fr-FR"
  if (/^[a-z]{2,3}-[A-Z]{2}$/.test(value)) return value;

  const code = LANGUAGE_CODES[value.toUpperCase() as LanguageName];
  if (!code) {
    throw new Error(`No language code mapped for "${language}"`);
  }
  return code;
}

// Optional reverse lookup, e.g. "fr-FR" -> "FRENCH"
export function toLanguageName(code: string): string | undefined {
  return Object.entries(LANGUAGE_CODES).find(([, c]) => c === code)?.[0];
}