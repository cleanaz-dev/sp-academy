import {
  RegExpMatcher,
  englishDataset,
  englishRecommendedTransformers,
} from "obscenity";

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20; // you had 30, change here if you prefer
export const USERNAME_RE = new RegExp(
  `^[a-z0-9_.]{${USERNAME_MIN},${USERNAME_MAX}}$`,
);

const RESERVED = new Set([
  "admin", "administrator", "support", "help", "staff", "moderator",
  "spoon", "spoonacademy", "root", "system", "null", "undefined",
]);

const matcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

/** lowercase + strip anything not allowed + enforce max length */
export const normalizeUsername = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9_.]/g, "").slice(0, USERNAME_MAX);

export function isUsernameClean(username: string): boolean {
  return !matcher.hasMatch(username);
}

/** returns an error message, or null if valid */
export function validateUsername(raw: string): string | null {
  const u = normalizeUsername(raw);
  if (u.length < USERNAME_MIN) return `At least ${USERNAME_MIN} characters.`;
  if (!USERNAME_RE.test(u)) return "Letters, numbers, _ and . only.";
  if (RESERVED.has(u)) return "That username isn't available.";
  if (!isUsernameClean(u)) return "Please choose a different username.";
  return null;
}