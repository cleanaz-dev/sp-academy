// lib/username.ts
import {
  uniqueNamesGenerator,
  adjectives,
  animals,
  type Config,
} from "unique-names-generator";
import { USERNAME_MAX, isUsernameClean } from "./username-validation";

const config: Config = {
  dictionaries: [adjectives, animals],
  separator: "",
  style: "lowerCase", // swiftotter
  length: 2,
};

const randomSuffix = () => Math.floor(Math.random() * 900 + 100); // 3 digits

export function generateUsername(): string {
  for (let i = 0; i < 20; i++) {
    const name = `${uniqueNamesGenerator(config)}${randomSuffix()}`;
    if (name.length <= USERNAME_MAX && isUsernameClean(name)) return name;
  }

  // fallback: short animal + suffix
  const animal = uniqueNamesGenerator({
    dictionaries: [animals],
    style: "lowerCase",
  });
  return `${animal}${randomSuffix()}`.slice(0, USERNAME_MAX);
}