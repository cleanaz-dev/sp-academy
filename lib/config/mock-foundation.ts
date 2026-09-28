export const MOCK_FOUNDATION_DATA_EN_FR = {
  userId: "usr_paul",
  foundationCourseId: "course_test",
  orderIndex: 1,
  status: "ready",
  visualContent: {
    imageS3Key: "foundation/usr_paul/day1/visual.png",
    npcAudioS3Key: "foundation/usr_paul/day1/npc.mp3",
    sceneDescription:
      "A neighbor you have never met stops you in your tidy apartment hallway to introduce herself.",
    altText:
      "A tidy apartment hallway with potted plants along the wall; a smiling woman standing near a door extends her hand toward you in greeting.",
    npcLine: "Bonjour ! Je suis Marie, votre nouvelle voisine.",
    constraint: {
      requiredChunk: "Enchanté",
      validReplies: [
        "Enchanté.",
        "Enchanté, Marie.",
        "Bonjour ! Enchanté, Marie.",
      ],
    },
  },
  grammarContent: {
    targetSentence: "Bonjour. Enchanté. Je suis Paul.",
    nativeSentence: "Hello. Nice to meet you. I'm Paul.",
    romanizedSentence: null,
    words: [
      {
        word: "Bonjour",
        gloss: "Hello / Good day",
        role: "greeting (interjection)",
      },
      {
        word: "Enchanté",
        gloss: "Nice to meet you (lit. delighted)",
        role: "fixed polite phrase (masculine form, speaker is male)",
      },
      {
        word: "Je",
        gloss: "I",
        role: "subject pronoun",
      },
      {
        word: "suis",
        gloss: "am",
        role: "verb (1st person singular of être)",
      },
      {
        word: "Paul",
        gloss: "Paul",
        role: "name (complement of suis)",
      },
    ],
    highlightGroup: ["Bonjour", "Enchanté", "Je", "suis"],
    clozeItems: [
      {
        id: "cloze-1",
        hostSentence: "Bonjour. Enchanté. Je suis Paul.",
        blankPosition: 1,
        acceptableAnswers: ["Enchanté", "enchanté"],
        wrongAnswerFeedback: [
          {
            wrong: "Enchantée",
            feedback:
              "You are a man, so use the masculine form 'Enchanté' — 'Enchantée' with the extra 'e' is the feminine form.",
          },
          {
            wrong: "Merci",
            feedback:
              "'Merci' means 'thank you'. To say 'nice to meet you' here, use 'Enchanté'.",
          },
        ],
      },
      {
        id: "cloze-2",
        hostSentence: "Bonjour. Enchanté. Je suis Paul.",
        blankPosition: 3,
        acceptableAnswers: ["suis"],
        wrongAnswerFeedback: [
          {
            wrong: "es",
            feedback:
              "'es' goes with 'tu' (informal you). With 'je', always use 'suis'.",
          },
          {
            wrong: "est",
            feedback:
              "'est' goes with 'il/elle' (he/she). With 'je', use 'suis'.",
          },
        ],
      },
      {
        // Different host sentence (not a variant of targetSentence)
        id: "cloze-3",
        hostSentence: "Il est matin. Je dis bonjour à mon voisin.",
        blankPosition: 5,
        acceptableAnswers: ["bonjour"],
        wrongAnswerFeedback: [
          {
            wrong: "bonsoir",
            feedback:
              "'bonsoir' is for the evening. The sentence says it is morning ('matin'), so use 'bonjour'.",
          },
          {
            wrong: "merci",
            feedback:
              "'merci' means 'thank you'. Here you need the greeting 'bonjour'.",
          },
        ],
      },
    ],
  },
  pronunciationData: {
    referenceText: "Bonjour. Enchanté. Je suis Paul.",
    audioS3Key: "foundation/usr_paul/day1/pronunciation.mp3",
    breakdown: [
      {
        text: "Bonjour",
        phonetic: "bɔ̃.ʒuʁ",
        hint: "The 'on' in Bonjour is one single nasal vowel — the 'n' is not pronounced separately.",
      },
      {
        text: "Enchanté",
        phonetic: "ɑ̃.ʃɑ̃.te",
        hint: "Both 'en' and 'an' are nasal vowels here; the 'n's disappear into the vowel sounds.",
      },
      { text: "Je", phonetic: "ʒə", hint: null },
      { text: "suis", phonetic: "sɥi", hint: null },
      { text: "Paul", phonetic: "pol", hint: null },
    ],
    focusSounds: [
      {
        sound: "nasal on (ɔ̃)",
        positions: [0],
      },
    ],
  },
  listeningContent: {
    id: "listen-1",
    referenceText: "Bonjour. Enchanté. Je suis Paul.",
    audioS3Key: "foundation/usr_paul/day1/listening.mp3",
    expectedOrder: ["Bonjour", "Enchanté", "Je", "suis", "Paul"],
    wordBank: [
      "Enchanté",
      "Je",
      "suis",
      "Bonjour",
      "Paul",
      "es",
      "bonsoir",
      "enchantée",
    ], // Scrambled with distractors
    contrast:
      "daytime vs evening greeting, masculine vs feminine agreement, and je suis vs tu es",
  },
  quizContent: {
    items: [
      {
        type: "verbal_cloze",
        prompt: "Bonjour. ___. Je suis Paul.",
        hint: "Nice to meet you — the polite phrase when meeting someone (you're a man)",
        acceptableAnswers: ["enchanté", "Enchanté"],
        feedback: "Say 'Enchanté' — no extra 'e', since you're a man.",
      },
      {
        type: "reorder",
        prompt: "Translate: 'Hello. Nice to meet you. I'm Paul.'",
        expectedWords: ["Bonjour.", "Enchanté.", "Je", "suis", "Paul."],
        scrambledBank: [
          "Bonjour.",
          "bonsoir",
          "salut",
          "suis",
          "sont",
          "Enchanté.",
          "Paul.",
          "Je",
        ],
      },
      {
        type: "true_false",
        statement:
          "It's 9 p.m. and Paul runs into his neighbor in the hallway. He greets her with 'Bonjour' and says 'Je suis Paul.'",
        isTrue: false,
        explanation:
          "After dark, use 'Bonsoir' instead of 'Bonjour' — 'Bonjour' is for the daytime.",
      },
      {
        type: "verbal_cloze",
        prompt: "Bonjour. Enchanté. Je ___ Paul.",
        hint: "I 'am' — the être form for 'I'",
        acceptableAnswers: ["suis", "Suis"],
        feedback: "Use 'suis': 'je suis' means 'I am'.",
      },
    ],
    passThreshold: 0.7,
  },
  freestyle: {
    mode: "SPECIFIC",
    level: "ZERO",
    topic: "Greeting a Neighbor",
    persona:
      "a friendly neighbor you run into in the hallway of your apartment building in Paris",
    requiredChunks: ["Bonjour", "Enchanté", "Je suis"],
    openingLine:
      "Paul, you've just bumped into a neighbor in your apartment building — greet them in French, give your name politely, and say it's nice to meet them.",
  },
  lessonHandoff: {
    day: 1,
    theme: "Greetings and Names",
    targetSentence: "Bonjour. Enchanté. Je suis Paul.",
    chunks: [
      "bonjour / bon après-midi",
      "bonjour (le matin, poli)",
      "bonsoir",
      "enchanté(e)",
      "merci",
      "polite name statement (I am / my name is — polite form)",
      "please call me [name]",
    ],
    npcLine: "Bonjour ! Je suis Marie, votre nouvelle voisine.",
    freestyleTopic: "Greeting a Neighbor",
    introNative:
      "Hi Paul! Today you'll learn how to greet a neighbor in French and introduce yourself politely.",
    introTarget:
      "Salut Paul ! Aujourd'hui, tu apprends à dire bonjour et à te présenter en français.",
    outroNative:
      "Well done, Paul! You can now greet someone in French and say your name politely. How do you feel about today's lesson?",
    outroTarget:
      "Bravo Paul ! Tu sais maintenant dire bonjour et donner ton nom en français. Comment te sens-tu après cette leçon ?",
    introNativeAudio: "foundation/usr_paul/day1/intro_native.mp3",
    introTargetAudio: "foundation/usr_paul/day1/intro_target.mp3",
    outroNativeAudio: "foundation/usr_paul/day1/outro_native.mp3",
    outroTargetAudio: "foundation/usr_paul/day1/outro_target.mp3",
    npcAudio: "foundation/usr_paul/day1/npc.mp3",
    taughtChunks: ["Bonjour", "Enchanté", "Je", "suis"],
    blankedWords: ["Enchanté", "suis", "bonjour"],
    wrongAnswers: ["Enchantée", "Merci", "es", "est", "bonsoir"],
    pronunciationSound: "nasal on (ɔ̃)",
    listeningContrast:
      "daytime vs evening greeting, masculine vs feminine agreement, and je suis vs tu es",
    visualRequiredChunk: "Enchanté",
    sceneDescription:
      "A neighbor you have never met stops you in your tidy apartment hallway to introduce herself.",
    freestylePersona:
      "a friendly neighbor you run into in the hallway of your apartment building in Paris",
    trueFalseStatement:
      "It's 9 p.m. and Paul runs into his neighbor in the hallway. He greets her with 'Bonjour' and says 'Je suis Paul.'",
  },
};

export const MOCK_FOUNDATION_DATA_EN_ES = {
  userId: "usr_annalia",
  foundationCourseId: "course_test",
  orderIndex: 1,
  status: "ready",
  visualContent: {
    imageS3Key: "foundation/usr_annalia/day1/visual.png",
    npcAudioS3Key: "foundation/usr_annalia/day1/npc.mp3",
    sceneDescription:
      "In the tidy hallway of your apartment building, a friendly neighbor standing near the potted plants by her door greets you and introduces herself as the new resident.",
    altText:
      "A tidy apartment hallway with several potted plants lined along the wall. A woman stands by one of the apartment doors, smiling and extending her hand in greeting toward the viewer.",
    npcLine:
      "¡Buenas tardes! Soy Carmen, la vecina nueva del 3B. Encantada de conocerte.",
    constraint: {
      requiredChunk: "Encantado de conocerte",
      validReplies: [
        "Encantado de conocerte, Carmen.",
        "Encantado de conocerte. Yo soy el nuevo vecino.",
        "Encantado de conocerte. ¿Vives en el 3B?",
      ],
    },
  },
  grammarContent: {
    targetSentence: "Buenas tardes. Soy Anna-leah. Encantado de conocerte.",
    nativeSentence: "Good afternoon. I'm Anna-leah. Nice to meet you.",
    romanizedSentence: null,
    words: [
      {
        word: "Buenas",
        gloss: "good (plural form used in greetings)",
        role: "greeting adjective",
      },
      {
        word: "tardes",
        gloss: "afternoon",
        role: "noun (part of time-of-day greeting)",
      },
      {
        word: "Soy",
        gloss: "I am",
        role: "verb (first person singular of 'ser', polite name statement)",
      },
      {
        word: "Anna-leah",
        gloss: "Anna-leah (your name)",
        role: "proper noun (name)",
      },
      {
        word: "Encantado",
        gloss: "delighted / nice (to meet you) — masculine form",
        role: "adjective (speaker's gender: M)",
      },
      {
        word: "de",
        gloss: "to (literally 'of')",
        role: "connector (preposition)",
      },
      {
        word: "conocerte",
        gloss: "to meet you",
        role: "verb (infinitive 'conocer' + object pronoun 'te')",
      },
    ],
    highlightGroup: ["Buenas", "tardes", "Soy", "Encantado", "de", "conocerte"],
    clozeItems: [
      {
        id: "cloze-1",
        hostSentence: "Buenas tardes. Soy Anna-leah. Encantado de conocerte.",
        blankPosition: 2,
        acceptableAnswers: ["Soy", "soy"],
        wrongAnswerFeedback: [
          {
            wrong: "Es",
            feedback:
              "Use 'Soy' (I am) to give your own name; 'Es' means 'he/she is' and sounds like you are introducing someone else.",
          },
          {
            wrong: "Estoy",
            feedback:
              "'Estoy' is for temporary states or location; to state your name, use 'Soy'.",
          },
        ],
      },
      {
        id: "cloze-2",
        hostSentence: "Buenas tardes. Soy Anna-leah. Encantado de conocerte.",
        blankPosition: 4,
        acceptableAnswers: ["Encantado", "encantado"],
        wrongAnswerFeedback: [
          {
            wrong: "Encantada",
            feedback:
              "As a male speaker, say 'encantado'; 'encantada' is the feminine form used by women.",
          },
          {
            wrong: "Encantados",
            feedback:
              "You are speaking only for yourself, so use the singular 'encantado', not the plural 'encantados'.",
          },
        ],
      },
      {
        // Different host sentence (not a variant of targetSentence)
        id: "cloze-3",
        hostSentence: "Muchas gracias por su ayuda, señora.",
        blankPosition: 1,
        acceptableAnswers: ["gracias", "Gracias"],
        wrongAnswerFeedback: [
          {
            wrong: "gracia",
            feedback:
              "Keep the final -s: the fixed word for 'thank you' is 'gracias'; 'gracia' alone means 'grace'.",
          },
          {
            wrong: "buenas",
            feedback:
              "'Buenas' belongs to greetings like 'buenas tardes'; to thank someone, say 'gracias'.",
          },
        ],
      },
    ],
  },
  pronunciationData: {
    referenceText: "Buenas tardes. Soy Anna-leah. Encantado de conocerte.",
    audioS3Key: "foundation/usr_annalia/day1/pronunciation.mp3",
    breakdown: [
      { text: "Buenas", phonetic: "bwe.nas", hint: null },
      {
        text: "tardes",
        phonetic: "tar.des",
        hint: "The 'r' is a quick soft tap, like the 'dd' in the American English 'ladder'.",
      },
      { text: "Soy", phonetic: "soj", hint: null },
      {
        text: "Anna-leah",
        phonetic: "an.na.le.a",
        hint: "The 'h' is silent — say 'ah-na-LEH-ah'.",
      },
      { text: "Encantado", phonetic: "en.kan.ta.do", hint: null },
      {
        text: "de conocerte",
        phonetic: "de.ko.no.θer.te",
        hint: "Same soft tapped 'r' in '-cer-', quick like the 'dd' in 'ladder'.",
      },
    ],
    focusSounds: [
      {
        sound: "soft r",
        positions: [7],
      },
    ],
  },
  listeningContent: {
    id: "listen-1",
    referenceText: "Buenas tardes. Soy Anna-leah. Encantado de conocerte.",
    audioS3Key: "foundation/usr_annalia/day1/listening.mp3",
    expectedOrder: [
      "Buenas",
      "tardes",
      "Soy",
      "Anna-leah",
      "Encantado",
      "de",
      "conocerte",
    ],
    wordBank: [
      "Encantado",
      "Anna-leah",
      "buenos",
      "conocerte",
      "encantada",
      "de",
      "tardes",
      "Soy",
      "Buenas",
      "noches",
    ], // Scrambled with distractors
    contrast: "afternoon vs evening greeting and masculine vs feminine form",
  },
  quizContent: {
    items: [
      {
        type: "verbal_cloze",
        prompt: "Buenas ___. Soy Anna-leah. Encantado de conocerte.",
        hint: "Afternoon — the time-of-day greeting",
        acceptableAnswers: ["tardes", "Tardes"],
        feedback:
          "'Buenas tardes' means 'Good afternoon' — use 'tardes' for the afternoon.",
      },
      {
        type: "reorder",
        prompt: "Translate: 'Good afternoon. I'm Anna-leah. Nice to meet you.'",
        expectedWords: [
          "Buenas",
          "tardes.",
          "Soy",
          "Anna-leah.",
          "Encantado",
          "de",
          "conocerte.",
        ],
        scrambledBank: [
          "Soy",
          "conocerte.",
          "de",
          "llamo",
          "Encantado",
          "Anna-leah.",
          "Buenos",
          "tardes.",
          "Buenas",
          "noches",
        ],
      },
      {
        type: "true_false",
        statement:
          "It's 9 in the morning and Anna-leah greets his neighbor with 'Buenas tardes.'",
        isTrue: false,
        explanation:
          "'Buenas tardes' is for the afternoon — in the morning you should say 'Buenos días'.",
      },
      {
        type: "verbal_cloze",
        prompt: "Buenas tardes. Soy Anna-leah. ___ de conocerte.",
        hint: "Delighted — 'nice to meet you' (masculine form)",
        acceptableAnswers: ["encantado", "Encantado"],
        feedback:
          "Say 'Encantado' — as a man you use the masculine form; a woman would say 'Encantada'.",
      },
    ],
    passThreshold: 0.7,
  },
  freestyle: {
    mode: "SPECIFIC",
    level: "ZERO",
    topic: "Greeting a Neighbor",
    persona: "a friendly neighbor in the entrance hall of your apartment building",
    requiredChunks: ["Buenos días", "Encantado de conocerte", "Soy"],
    openingLine:
      "Anna-leah, it's morning and you run into a neighbor in the entrance hall of your apartment building — greet them, give your name, and say it's nice to meet them, in Spanish.",
  },
  lessonHandoff: {
    day: 1,
    theme: "Greetings and Names",
    targetSentence: "Buenas tardes. Soy Anna-leah. Encantado de conocerte.",
    chunks: [
      "hola / buenas tardes",
      "buenos días",
      "buenas noches",
      "encantado de conocerte / mucho gusto",
      "gracias",
      "polite name statement (I am / my name is — polite form)",
      "please call me [name]",
    ],
    npcLine:
      "¡Buenas tardes! Soy Carmen, la vecina nueva del 3B. Encantada de conocerte.",
    freestyleTopic: "Greeting a Neighbor",
    introNative:
      "Hi Anna-leah! Today you'll learn how to greet a neighbor at the right time of day and introduce yourself in Spanish — a must-have for your travels.",
    introTarget:
      "¡Hola, Anna-leah! Hoy aprendemos a saludar y a decir tu nombre en español.",
    outroNative:
      "Great job today, Anna-leah! You can now greet someone by the time of day and give your name politely in Spanish. How do you feel about the lesson?",
    outroTarget:
      "¡Muy bien, Anna-leah! Ya puedes saludar y decir tu nombre en español. ¿Cómo te sientes con la lección?",
    introNativeAudio: "foundation/usr_annalia/day1/intro_native.mp3",
    introTargetAudio: "foundation/usr_annalia/day1/intro_target.mp3",
    outroNativeAudio: "foundation/usr_annalia/day1/outro_native.mp3",
    outroTargetAudio: "foundation/usr_annalia/day1/outro_target.mp3",
    npcAudio: "foundation/usr_annalia/day1/npc.mp3",
    taughtChunks: ["Buenas", "tardes", "Soy", "Encantado", "de", "conocerte"],
    blankedWords: ["Soy", "Encantado", "gracias", "tardes"],
    wrongAnswers: ["Es", "Estoy", "Encantada", "Encantados", "gracia", "buenas"],
    pronunciationSound: "soft r",
    listeningContrast: "afternoon vs evening greeting and masculine vs feminine form",
    visualRequiredChunk: "Encantado de conocerte",
    sceneDescription:
      "In the tidy hallway of your apartment building, a friendly neighbor standing near the potted plants by her door greets you and introduces herself as the new resident.",
    freestylePersona:
      "a friendly neighbor in the entrance hall of your apartment building",
    trueFalseStatement:
      "It's 9 in the morning and Anna-leah greets his neighbor with 'Buenas tardes.'",
  },
};