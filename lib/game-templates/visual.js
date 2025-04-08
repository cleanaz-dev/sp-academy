import PictureTimePreview from "@/components/games/preview/PictureTimePreview";

export default {
  name: "Picture Time!",
  slug: "picture-time",
  needsImages: false,
  needsAudio: false,

  createPrompt(data) {
    return `You are a game-generating assistant. The game is an image guessing game in this language ${data.language} LANGUAGE OUTPUT MUST BE IN LANGUAGE ${data.language}. Here is the theme: ${data.theme}. Your task is to generate image prompts (IN ENGLISH) along with four corresponding answers in : ${data.language}, where one answer is correct. You will create 5 of these.

    ONLY OUTPUT JSON array like this:
    
    [
      {
        "image-0": "correct answer in one word(english)",        
        "answer": "correct answer",
        "choices": ["choice1", "choice2", "choice3", "choice4"],
        "correctAnswerIndex": 0
      },
      {
        "image-1": "correct answer in one word(english)", 
        "answer": "correct answer",
        "choices": ["choice1", "choice2", "choice3", "choice4"],
        "correctAnswerIndex": 2
      }
      //... up to 5 items
    ]`;
  },

  parseResponse(responseText) {
    return JSON.parse(responseText);
  },

  postProcess(data) {
    // Add any grammar-specific formatting
    return data;
  },

  previewComponent: PictureTimePreview,
};
