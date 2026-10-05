export const LANGUAGES = [
  { name: "English", flag: "🇬🇧" },
  { name: "French", flag: "🇫🇷" },
  { name: "Spanish", flag: "🇪🇸" },
];

export const LEVELS = [
  { name: "Beginner", description: "I'm just getting started" },
  { name: "Elementary", description: "I know some basics" },
  { name: "Intermediate", description: "I can hold simple conversations" },
  { name: "Advanced", description: "I want to become highly fluent" },
];

export const GOALS = [
  "Speaking",
  "Listening",
  "Reading",
  "Writing",
  "Everything",
];

export const USERNAME_RE = /^[a-zA-Z0-9_.]{3,30}$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;