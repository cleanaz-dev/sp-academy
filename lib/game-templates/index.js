// lib/game-templates/index.js
import visual from "./visual";
import grammar from "./grammar";
import verbal from "./verbal";

// Combine all templates into an array
const templates = [visual, grammar, verbal];

// Validate uniqueness of slugs
const slugs = new Set();
templates.forEach((template) => {
  if (slugs.has(template.slug)) {
    throw new Error(`Duplicate slug detected: ${template.slug}`);
  }
  slugs.add(template.slug);
});

// Export the array of templates
export default templates;
