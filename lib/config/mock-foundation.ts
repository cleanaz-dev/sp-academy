export const MOCK_FOUNDATION_DATA = {
  userId: "usr_test",
  foundationCourseId: "course_test",
  orderIndex: 1,
  status: "ready",
  visualContent: {
    imageS3Key: "foundation/usr_test/day1/visual.png",
    // NEW: wasn't present on the old mock — visual scene now has its own NPC audio clip
    npcAudioS3Key: "foundation/usr_test/day1/npc.mp3",
    sceneDescription:
      "In the tidy hallway of your new apartment building, your neighbor Marie greets you beside the potted plants and introduces herself with a handshake.",
    altText:
      "A tidy apartment hallway with potted plants lined along one wall. A smiling woman in casual clothes stands facing the viewer, extending her right hand in greeting.",
    npcLine:
      "Bonjour ! Vous êtes le nouveau voisin, n'est-ce pas ? Moi, c'est Marie, j'habite juste à côté. Ravi de vous rencontrer !",
    constraint: {
      requiredChunk: "enchanté",
      validReplies: [
        "Bonjour, je suis le nouveau voisin, enchanté !",
        "Enchanté, Marie ! Je viens d'emménager.",
        "Bonjour ! Enchanté de faire votre connaissance.",
      ],
    },
  },
  grammarContent: {
    targetSentence: "Bonjour, je suis Paul, enchanté !",
    nativeSentence: "Hello, I'm Paul — nice to meet you!",
    romanizedSentence: null,
    words: [
      {
        word: "Bonjour",
        gloss: "hello / good day",
        role: "interjection (greeting)",
      },
      {
        word: "je",
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
        gloss: "Paul (name)",
        role: "proper noun (name in polite self-introduction)",
      },
      {
        word: "enchanté",
        gloss: "nice to meet you (literally: delighted)",
        role: "fixed polite phrase (masculine form)",
      },
    ],
    // NOTE: old mock highlighted "Je" + "suis" as two separate items; new data
    // groups them as a single "je suis" chunk — adjust any highlight-matching
    // logic that assumed one highlightGroup entry === one word.
    highlightGroup: ["Bonjour", "je suis", "enchanté"],
    clozeItems: [
      {
        id: "cloze-1",
        hostSentence: "Bonjour, je suis Paul, enchanté !",
        blankPosition: 2,
        acceptableAnswers: ["suis"],
        wrongAnswerFeedback: [
          {
            wrong: "est",
            feedback:
              "'Je' always pairs with 'suis' — 'est' is only used with 'il' or 'elle'.",
          },
          {
            wrong: "es",
            feedback: "'es' goes with 'tu'; with 'je' you must say 'suis'.",
          },
        ],
      },
      {
        id: "cloze-2",
        hostSentence: "Bonjour, je suis Paul, enchanté !",
        blankPosition: 4,
        acceptableAnswers: ["enchanté"],
        wrongAnswerFeedback: [
          {
            wrong: "enchantée",
            feedback:
              "You are a man, so use the masculine form 'enchanté' without the extra -e.",
          },
          {
            wrong: "bonsoir",
            feedback:
              "'bonsoir' is an evening greeting; to say 'nice to meet you', use 'enchanté'.",
          },
        ],
      },
      {
        // NOTE: old mock's 3rd clozeItem blanked "suis" again in the same
        // targetSentence. New data instead uses a *different* host sentence
        // ("Merci beaucoup, monsieur.") to drill a bonus word ("merci") that
        // isn't in targetSentence at all — components that assume every
        // clozeItem.hostSentence is a variant of grammarContent.targetSentence
        // will need to be relaxed.
        id: "cloze-3",
        hostSentence: "Merci beaucoup, monsieur.",
        blankPosition: 0,
        acceptableAnswers: ["Merci", "merci"],
        wrongAnswerFeedback: [
          {
            wrong: "bonjour",
            feedback: "'bonjour' is a greeting; use 'merci' to thank someone.",
          },
          {
            wrong: "enchanté",
            feedback:
              "'enchanté' means 'nice to meet you' — here you are thanking someone, so use 'merci'.",
          },
        ],
      },
    ],
  },
  pronunciationData: {
    referenceText: "Bonjour, je suis Paul, enchanté !",
    audioS3Key: "foundation/usr_test/day1/pronunciation.mp3",
    breakdown: [
      {
        text: "Bonjour",
        phonetic: "bɔ̃.ʒuʁ",
        hint: "The 'on' is one single nasal vowel — the 'n' is not pronounced as its own consonant.",
      },
      {
        text: "je suis",
        phonetic: "ʒə.sɥi",
        hint: "The final 's' in suis is silent.",
      },
      {
        text: "Paul",
        phonetic: "pɔl",
        hint: null,
      },
      {
        text: "enchanté",
        phonetic: "ɑ̃.ʃɑ̃.te",
        hint: null,
      },
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
    referenceText: "Bonjour, je suis Paul, enchanté !",
    audioS3Key: "foundation/usr_test/day1/listening.mp3",
    // RENAMED: old mock called this "expectedWords". New payload calls it
    // "expectedOrder" — same shape (ordered array of the target words), just
    // a new key name. Update whatever component reads expectedWords.
    expectedOrder: ["Bonjour", "je", "suis", "Paul", "enchanté"],
    wordBank: [
      "es",
      "enchanté",
      "Bonjour",
      "bonsoir",
      "Paul",
      "suis",
      "je",
      "enchantée",
    ], // Scrambled with distractors
    // CHANGED SHAPE: old mock's "contrastFeedback" was an object
    // { triggerWord, message } used to show a specific correction when the
    // user picked one particular wrong word. New data instead sends a plain
    // free-text "contrast" string describing the general contrast being
    // tested (not tied to a single triggerWord). If your component needs a
    // triggerWord/message pair for a toast/callout, you'll need to either
    // parse this string yourself or have the backend keep sending the old
    // shape too.
    contrast:
      "daytime vs evening greeting, masculine vs feminine ending, je vs tu verb form",
  },
  quizContent: {
    items: [
      {
        type: "verbal_cloze",
        prompt: "___, je suis Paul, enchanté !",
        hint: "Daytime greeting",
        acceptableAnswers: ["bonjour", "Bonjour"],
        feedback: "Not quite — the daytime greeting in French is 'bonjour'.",
      },
      {
        type: "reorder",
        prompt: "Translate: 'Hello, I'm Paul — nice to meet you!'",
        expectedWords: ["Bonjour,", "je", "suis", "Paul,", "enchanté", "!"],
        scrambledBank: [
          "!",
          "Bonjour,",
          "sont",
          "bonsoir",
          "enchantée",
          "Paul,",
          "je",
          "suis",
          "enchanté",
        ],
      },
      {
        type: "true_false",
        statement:
          "It's 9 p.m. and Paul runs into his neighbor in the hallway. Saying 'Bonjour' is the correct greeting for this time of day.",
        isTrue: false,
        explanation:
          "In the evening, switch to 'bonsoir' — 'bonjour' is the daytime greeting.",
      },
      {
        type: "verbal_cloze",
        prompt: "Bonjour, je suis Paul, ___ !",
        hint: "The polite phrase for meeting someone for the first time",
        acceptableAnswers: ["enchanté", "Enchanté", "enchante", "Enchante"],
        feedback:
          "Almost — since Paul is a man, he says 'enchanté', without the extra -e.",
      },
    ],
    passThreshold: 0.7,
  },
  freestyle: {
    mode: "SPECIFIC",
    level: "ZERO",
    topic: "Meeting a Neighbor",
    persona:
      "a friendly neighbor you run into in the hallway of your apartment building in Paris",
    // NOTE: old mock's requiredChunks included a 4th item, "Je suis [nom]"
    // (a templated placeholder). New data's requiredChunks list only has 3
    // literal chunks and drops the placeholder-style entry.
    requiredChunks: ["Bonjour", "Enchanté", "Je suis"],
    openingLine:
      "Paul, you've just bumped into a neighbor in your apartment building — greet them in French, introduce yourself politely, and say it's nice to meet them.",
  },
  // EXPANDED: old mock's lessonHandoff had 6 fields. New payload's
  // lessonHandoff is much richer — it now carries intro/outro copy + audio,
  // per-section "taught/blanked/wrong" rollups, and duplicates a few fields
  // that also live deeper in the object (sceneDescription, npcLine/npcAudio,
  // pronunciationSound, listeningContrast, etc.) so a lesson-summary screen
  // can render without walking the whole payload. Treat this block as the
  // "flattened summary" of everything above it.
  lessonHandoff: {
    day: 1,
    theme: "Greetings and Names",
    targetSentence: "Bonjour, je suis Paul, enchanté !",
    chunks: [
      "bonjour / bon après-midi",
      "bonjour (le matin, poli)",
      "bonsoir",
      "enchanté(e)",
      "merci",
      "polite name statement (I am / my name is — polite form)",
      "please call me [name]",
    ],
    npcLine:
      "Bonjour ! Vous êtes le nouveau voisin, n'est-ce pas ? Moi, c'est Marie, j'habite juste à côté. Ravi de vous rencontrer !",
    freestyleTopic: "Meeting a Neighbor",
    // NEW fields below — none of these existed on the old mock's lessonHandoff
    introNative:
      "Hi Paul! Today you'll learn how to greet someone in French and politely tell them your name — perfect for meeting a new neighbor.",
    introTarget:
      "Bonjour Paul ! Aujourd'hui, on apprend à dire bonjour et à donner son nom en français.",
    outroNative:
      "Great job today, Paul! You can now greet someone in French and introduce yourself politely. How do you feel about the lesson?",
    outroTarget:
      "Bravo Paul ! Tu sais maintenant dire bonjour et donner ton nom en français. Comment te sens-tu ?",
    introNativeAudio: "foundation/usr_test/day1/intro_native.mp3",
    introTargetAudio: "foundation/usr_test/day1/intro_target.mp3",
    outroNativeAudio: "foundation/usr_test/day1/outro_native.mp3",
    outroTargetAudio: "foundation/usr_test/day1/outro_target.mp3",
    npcAudio: "foundation/usr_test/day1/npc.mp3",
    taughtChunks: ["Bonjour", "je suis", "enchanté"],
    blankedWords: ["suis", "enchanté", "Merci", "bonjour"],
    wrongAnswers: ["est", "es", "enchantée", "bonsoir", "bonjour", "enchanté"],
    pronunciationSound: "nasal on (ɔ̃)",
    listeningContrast:
      "daytime vs evening greeting, masculine vs feminine ending, je vs tu verb form",
    visualRequiredChunk: "enchanté",
    sceneDescription:
      "In the tidy hallway of your new apartment building, your neighbor Marie greets you beside the potted plants and introduces herself with a handshake.",
    freestylePersona:
      "a friendly neighbor you run into in the hallway of your apartment building in Paris",
    trueFalseStatement:
      "It's 9 p.m. and Paul runs into his neighbor in the hallway. Saying 'Bonjour' is the correct greeting for this time of day.",
  },
};