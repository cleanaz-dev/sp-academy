// lib/game-templates/verbal.js
export default {
  name: "Verbal Challenge",
  slug: "verbal",
  needsAudio: true, // Verbal games need audio
  needsImages: false,

  createPrompt(data) {
    return `Generate spoken language exercises...`;
  },
};
