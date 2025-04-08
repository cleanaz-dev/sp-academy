// components/generate-lesson/mockLessonContent.js
export const generateMockExercises = (apiData) => {
  const {
    level = "Novice",
    focusArea = "General",
    exercises = {
      fill_in_blank: 1,
      matching_pairs: 1,
      audio_based: 1,
      image_word_input: 1,
      verb_scene_illustrator: 1, // Add it here
    },
  } = apiData;
  const randomScene1 = "A sunny park with people walking"; // Mock scene
  const randomScene2 = "A classroom with students talking"; // Mock scene
  const exerciseList = [];

  // Base vocab for simplicity (adjust based on focusArea later)
  const vocab = [
    { french: "je mange", english: "I eat" },
    { french: "tu manges", english: "you eat" },
    { french: "je regarde", english: "I look at" },
    { french: "tu regardes", english: "you look at" },
    { french: "une", english: "a" },
    { french: "un", english: "a" },
    { french: "pomme rouge", english: "red apple" },
    { french: "chien brun", english: "brown dog" },
    { french: "grand", english: "big" },
    { french: "petit", english: "small" },
  ];

  const verbs = [
    { infinitive: "manger", conjugation: "je mange" },
    { infinitive: "courir", conjugation: "je cours" },
    { infinitive: "regarder", conjugation: "je regarde" },
  ];
  const adjectives = ["délicieux", "rapide", "joli"];
  const nouns = ["pomme", "chien", "fleur"];

  // Single sentence and its scrambled version (outside case)
  const targetSentence = ["je mange", "une", "pomme rouge"];
  const scrambledSentence = [...targetSentence].sort(() => Math.random() - 0.5); // Scramble the words

  // Generate exercises based on counts in apiData.exercises
  Object.entries(exercises).forEach(([type, count]) => {
    for (let i = 0; i < count; i++) {
      switch (type) {
        case "drag_and_drop":
          exerciseList.push({
            title: `Déplacement des Mots ${i + 1}`,
            type: "drag_and_drop",
            question: `Déplacez les mots pour former une phrase correcte (${randomScene2}).`,
            scrambledWords: ["salut", "je", "suis", "Marie"],
            correctAnswer: "Salut, je suis Marie.",
            feedback: "This is a casual way to say 'Hi, I am Marie.'",
          });
          break;
        case "fill_in_blank":
          exerciseList.push({
            title: `Remplissez le Vide ${i + 1}`,
            type: "fill_in_blank",
            question: "Complétez les phrases avec un mot appris.",
            sentences: ["[___], je suis Paul!", "Je dis [___] quand je pars."],
            correctAnswer: ["Salut", "au revoir"],
            options: [
              ["Salut", "Bonjour"],
              ["au revoir", "merci"],
            ],
            feedback: "'Salut' is a greeting, and 'au revoir' means goodbye.",
          });
          break;
        case "audio_based":
          exerciseList.push({
            title: `Écoute et Réponds ${i + 1}`,
            type: "audio_based",
            question: "Écoutez et choisissez la bonne réponse.",
            audioScript: "Bonjour, comment vas-tu?",
            multipleChoice: [
              "Salut!",
              "Merci beaucoup!",
              "Au revoir.",
              "Je vais bien.",
            ],
            correctAnswer: "3",
            feedback: {
              correct: "Good! 'Je vais bien' means 'I am good.'",
              incorrect: "Listen again—it's asking how you are.",
            },
          });
          break;
        case "matching_pairs":
          exerciseList.push({
            title: `Associez les Paires ${i + 1}`,
            type: "matching_pairs",
            question: "Associez les mots français à leurs traductions.",
            pairs: [
              { word: "bonjour", match: "hello" },
              { word: "merci", match: "thank you" },
              { word: "salut", match: "hi" },
              { word: "au revoir", match: "goodbye" },
            ],
            feedback: "These are basic greetings and responses.",
            additional_data: { category: focusArea, difficulty: level },
          });
          break;
        case "image_word_input":
          exerciseList.push({
            title: `Décrivez l’Image ${i + 1}`,
            type: "image_word_input",
            question: `Décrivez cette scène : ${randomScene1}.`,
            image_prompt: randomScene1,
            imageUrl: "placeholder.jpg",
            correctAnswer: randomScene1,
            feedback: "This describes a sunny park scene politely.",
            additional_data: { vocabulary_focus: "", difficulty: level },
          });
          break;
        case "verb_scene_illustrator":
          exerciseList.push({
            title: `Construisez une Phrase ${i + 1}`,
            type: "verb_scene_illustrator",
            question:
              "Mettez les mots dans le bon ordre pour former une phrase correcte.",
            scrambledWords: [...scrambledSentence], // Fresh copy of scrambled sentence
            correctAnswer: targetSentence, // Correct order
            slots: Array(targetSentence.length)
              .fill("")
              .map((_, idx) => `${idx + 1}`), // e.g., ["1", "2", "3"]
            feedback:
              "Bien joué ! 'Je mange une pomme rouge' est une phrase simple et correcte.",
          });
          break;
        default:
          break;
      }
    }
  });

  return { exercises: exerciseList };
};

export const generateMockLessonContent = (apiData) => {
  const {
    title = "Untitled Lesson",
    focusArea = "General",
    level = "Novice",
    objectives = [],
    includeLecture = true,
    includeExercise = true,
    generateImage = true,
    exercises = {},
  } = apiData;

  let content = `
⏱️ Estimated Reading Time: 3 minutes

# 🌟 ${title} / ${title.split(" ").slice(1).join(" ")} en Français
`;

  if (generateImage) {
    content += `
[generatedImage]{ "prompt": "People learning in a classroom or casual setting" }
`;
  }

  if (includeLecture) {
    content += `
## Mots de Base / Basic Words

[topic]{ "french": "Salut, vous commencez le français ! Les mots sont vos premiers pas pour parler. Aujourd’hui, nous apprenons des bases simples${
      focusArea ? ` sur ${focusArea.toLowerCase()}` : ""
    }. Ce sont des mots faciles pour les ${level.toLowerCase()}s et parfaits pour tous les jours. Que voulez-vous dire ?", "english": "Hi, you’re starting French! Words are your first steps to speaking. Today, we learn simple basics${
      focusArea ? ` about ${focusArea.toLowerCase()}` : ""
    }. They’re easy for ${level.toLowerCase()}s and perfect for every day. What do you want to say?" }

[vocab]{"title": {"french": "Mots pour ${focusArea || "Saluer"}", "english": "Words for ${focusArea || "Greeting"}"}, "items": [{"french": "bonjour", "english": "hello", "example": {"french": "Bonjour, toi!", "english": "Hello, you!"}}, {"french": "salut", "english": "hi", "example": {"french": "Salut, ça va?", "english": "Hi, how are you?"}}, {"french": "merci", "english": "thank you", "example": {"french": "Merci beaucoup!", "english": "Thank you so much!"}}], "context": {"french": "Ces mots sont simples. ‘Bonjour’ est poli, ‘salut’ est amical, ‘merci’ est gentil.", "english": "These words are simple. ‘Bonjour’ is polite, ‘salut’ is friendly, ‘merci’ is kind."}} 

## Un Petit Dialogue / A Short Dialogue

[topic]{ "french": "Un dialogue rend le français vivant ! Pour les ${level.toLowerCase()}s, c’est une façon amusante d’entendre${
      focusArea ? ` ${focusArea.toLowerCase()}` : ""
    }. Écoutez ces amis. C’est court et facile. Que remarquez-vous ?", "english": "A dialogue makes French alive! For ${level.toLowerCase()}s, it’s a fun way to hear${
      focusArea ? ` ${focusArea.toLowerCase()}` : ""
    }. Listen to these friends. It’s short and easy. What do you notice?" }

[dialogue]{ "title": {"french": "Un Dialogue Simple", "english": "A Simple Dialogue"}, "lines": [{"speaker": "Marie", "french": "Salut, Paul!", "english": "Hi, Paul!"}, {"speaker": "Paul", "french": "Bonjour, Marie! Merci!", "english": "Hello, Marie! Thank you!"}], "analysis": {"french": "‘Salut’ est rapide, ‘bonjour’ est poli, ‘merci’ est gentil. Que diriez-vous ?", "english": "‘Salut’ is quick, ‘bonjour’ is polite, ‘merci’ is kind. What would you say?"} }

## Parlez Maintenant / Speak Now

[topic]{ "french": "Parler fort aide à apprendre ! Pour les ${level.toLowerCase()}s, dire les mots les fait rester. Nous pratiquons${
      focusArea ? ` ${focusArea.toLowerCase()}` : ""
    }. Pouvez-vous les dire sans hésiter ?", "english": "Speaking loud helps you learn! For ${level.toLowerCase()}s, saying words makes them stick. We practice${
      focusArea ? ` ${focusArea.toLowerCase()}` : ""
    }. Can you say them without hesitating?" }

[pronunciation]{ "title": {"french": "Dites-le!", "english": "Say It!"}, "items": [{"targetText": "Bonjour, salut!"}, {"targetText": "Merci beaucoup!"}] }
`;
  }

  if (includeExercise) {
    const { exercises: generatedExercises } = generateMockExercises(apiData);

    content += `
## Exercice / Exercise

[topic]{ "french": "Un exercice renforce${
      focusArea ? ` vos ${focusArea.toLowerCase()}` : " vos compétences"
    } ! Répondez avec les mots appris. C’est simple pour les ${level.toLowerCase()}s et vous aide à retenir. Êtes-vous prêt ?", "english": "An exercise strengthens${
      focusArea ? ` your ${focusArea.toLowerCase()}` : " your skills"
    }! Answer with the words you learned. It’s simple for ${level.toLowerCase()}s and helps you remember. Are you ready?" }
`;

    generatedExercises.forEach((exercise) => {
      content += `
[exercises]{ "title": {"french": "${exercise.title}", "english": "${exercise.title}"}, "type": "${
        exercise.type
      }", "question": "${exercise.question}",${
        exercise.scrambledWords
          ? ` "scrambledWords": ${JSON.stringify(exercise.scrambledWords)},`
          : ""
      }${
        exercise.sentences
          ? ` "sentences": ${JSON.stringify(exercise.sentences)},`
          : ""
      }${
        exercise.audioScript ? ` "audioScript": "${exercise.audioScript}",` : ""
      }${
        exercise.multipleChoice
          ? ` "multipleChoice": ${JSON.stringify(exercise.multipleChoice)},`
          : ""
      }${
        exercise.image_prompt
          ? ` "imagePrompt": "${exercise.image_prompt}", "imageUrl": "${exercise.imageUrl}",`
          : ""
      }${exercise.pairs ? ` "pairs": ${JSON.stringify(exercise.pairs)},` : ""}${
        exercise.verbs ? ` "verbs": ${JSON.stringify(exercise.verbs)},` : ""
      }${
        exercise.extras ? ` "extras": ${JSON.stringify(exercise.extras)},` : ""
      }${
        exercise.slots ? ` "slots": ${JSON.stringify(exercise.slots)},` : ""
      } "correctAnswer": ${
        exercise.correctAnswer === undefined
          ? "null"
          : typeof exercise.correctAnswer === "number"
            ? `"${exercise.correctAnswer}"`
            : JSON.stringify(exercise.correctAnswer)
      }, "feedback": ${
        typeof exercise.feedback === "string"
          ? `"${exercise.feedback}"`
          : JSON.stringify(exercise.feedback || null)
      }, "options": ${
        exercise.options ? JSON.stringify(exercise.options) : "[]"
      }${
        exercise.additional_data
          ? `, "additional_data": ${JSON.stringify(exercise.additional_data)}`
          : ""
      } }
`;
    });
  }

  return content.trim();
};
