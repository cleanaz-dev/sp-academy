export const MOCK_FOUNDATION_DATA_EN_FR_V0 = {
  userId: "usr_paul",
  name: "Paul",
  foundationCourseId: "course_test",
  nativeLang: "en-US", // <--- ADD THIS
  targetLang: "fr-FR", // <--- ADD THIS
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
export const MOCK_FOUNDATION_DATA_EN_FR = {
  userId: "usr_Paul",
  foundationCourseId: "course_test",
  name: "Paul",
  orderIndex: 1,
  nativeLang: "en-US",
  targetLang: "fr-FR",
  status: "ready",
  visualContent: {
    imageS3Key: "foundation/usr_Paul/day1/visual.png",
    npcAudioS3Key: "foundation/usr_Paul/day1/npc.mp3",
    sceneDescription:
      "In the tidy hallway of your apartment building, a friendly neighbor you've never met greets you beside the potted plants and introduces herself.",
    altText:
      "A tidy apartment hallway with pale walls and several potted plants lined along the floor; a smiling woman in her fifties stands facing the viewer, extending her hand in greeting.",
    npcLine:
      "Bonjour ! Moi c'est Madame Laurent, votre voisine du troisième étage.",
    constraint: {
      requiredChunk: "enchanté",
      validReplies: [
        "Enchanté, Madame Laurent !",
        "Bonjour ! Enchanté de faire votre connaissance.",
        "Enchanté ! Je viens d'emménager ici.",
      ],
    },
  },
  grammarContent: {
    targetSentence: "Bonjour, je suis Paul, enchanté.",
    nativeSentence: "Hello, I'm Paul — nice to meet you.",
    romanizedSentence: null,
    words: [
      {
        word: "Bonjour",
        gloss: "hello / good day",
        role: "greeting (interjection)",
      },
      {
        word: "je",
        gloss: "I",
        role: "subject pronoun",
      },
      {
        word: "suis",
        gloss: "am",
        role: "verb (1st person of être)",
      },
      {
        word: "Paul",
        gloss: "Paul",
        role: "name (complement of the verb)",
      },
      {
        word: "enchanté",
        gloss: "nice to meet you",
        role: "fixed polite phrase (masculine form)",
      },
    ],
    highlightGroup: ["Bonjour", "je suis", "enchanté"],
    clozeItems: [
      {
        id: "cloze-1",
        hostSentence: "Bonjour, je suis Paul, enchanté.",
        blankPosition: 2,
        acceptableAnswers: ["suis"],
        wrongAnswerFeedback: [
          {
            wrong: "es",
            feedback: "With 'je', say 'je suis' — 'es' only goes with 'tu'.",
          },
          {
            wrong: "est",
            feedback:
              "'Est' goes with he or she; when giving your own name, say 'je suis'.",
          },
        ],
      },
      {
        id: "cloze-2",
        hostSentence: "Bonjour, je suis Paul, enchanté.",
        blankPosition: 4,
        acceptableAnswers: ["enchanté", "Enchanté"],
        wrongAnswerFeedback: [
          {
            wrong: "enchantée",
            feedback: "You are a man, so drop the final -e and say 'enchanté'.",
          },
          {
            wrong: "merci",
            feedback:
              "'Merci' means 'thank you'; to say 'nice to meet you', use 'enchanté'.",
          },
        ],
      },
      {
        id: "cloze-3",
        hostSentence: "Merci beaucoup, monsieur.",
        blankPosition: 0,
        acceptableAnswers: ["Merci", "merci"],
        wrongAnswerFeedback: [
          {
            wrong: "bonjour",
            feedback: "'Bonjour' is a greeting; to thank someone, say 'merci'.",
          },
          {
            wrong: "s'il vous plaît",
            feedback:
              "'S'il vous plaît' means 'please'; to thank someone, say 'merci'.",
          },
        ],
      },
    ],
  },
  pronunciationData: {
    referenceText: "Bonjour, je suis Paul, enchanté.",
    audioS3Key: "foundation/usr_Paul/day1/pronunciation.mp3",
    breakdown: [
      {
        text: "Bonjour",
        phonetic: "bɔ̃.ʒuʁ",
        hint: "The 'on' in bonjour is one nasal vowel — say 'bon' without a clear n sound.",
      },
      {
        text: "je suis",
        phonetic: "ʒə.sɥi",
        hint: null,
      },
      {
        text: "Paul",
        phonetic: "pɔl",
        hint: null,
      },
      {
        text: "enchanté",
        phonetic: "ɑ̃.ʃɑ̃.te",
        hint: "Both 'en' and 'chan' are nasal vowels; the final 'é' sounds like 'ay'.",
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
    referenceText: "Bonjour, je suis Paul, enchanté.",
    audioS3Key: "foundation/usr_Paul/day1/listening.mp3",
    expectedOrder: ["Bonjour", "je", "suis", "Paul", "enchanté"],
    wordBank: [
      "je",
      "Paul",
      "enchantée",
      "bonsoir",
      "es",
      "suis",
      "Bonjour",
      "enchanté",
    ],
    contrast:
      "daytime vs evening greeting, masculine vs feminine agreement, and first vs second person verb form",
  },
  quizContent: {
    items: [
      {
        type: "verbal_cloze",
        prompt: "Bonjour, je ___ Paul, enchanté.",
        hint: "The 'am' in 'I am' (1st person of être)",
        acceptableAnswers: ["suis", "Suis"],
        feedback: "Use 'suis' — 'je suis' means 'I am'.",
      },
      {
        type: "reorder",
        prompt: "Translate: 'Hello, I'm Paul — nice to meet you.'",
        expectedWords: ["Bonjour,", "je", "suis", "Paul,", "enchanté."],
        scrambledBank: [
          "je",
          "Bonjour,",
          "suis",
          "Paul,",
          "enchanté.",
          "sont",
          "enchantée",
          "bonsoir",
        ],
      },
      {
        type: "true_false",
        statement:
          "It's 9 p.m. and Paul runs into his neighbor in the hallway. He greets her with 'Bonjour' — that's the right greeting for the evening.",
        isTrue: false,
        explanation:
          "In the evening, use 'Bonsoir'; 'Bonjour' is for the daytime.",
      },
      {
        type: "verbal_cloze",
        prompt: "Bonjour, je suis Paul, ___.",
        hint: "Polite phrase for 'nice to meet you' (masculine form)",
        acceptableAnswers: ["enchanté", "Enchanté"],
        feedback:
          "Say 'enchanté' — the polite 'nice to meet you', with no extra 'e' since Paul is a man.",
      },
    ],
    passThreshold: 0.7,
  },
  freestyle: {
    mode: "SPECIFIC",
    level: "ZERO",
    topic: "Greeting a Neighbor",
    persona:
      "a friendly neighbor you run into in the hallway of your apartment building",
    requiredChunks: ["Bonjour", "Enchanté", "Je suis"],
    openingLine:
      "Paul, you bump into your neighbor in the hallway of your apartment building — greet them in French, tell them your name politely, and say 'nice to meet you'.",
  },
  lessonHandoff: {
    day: 1,
    theme: "Greetings and Names",
    targetSentence: "Bonjour, je suis Paul, enchanté.",
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
      "Bonjour ! Moi c'est Madame Laurent, votre voisine du troisième étage.",
    freestyleTopic: "Greeting a Neighbor",
    introNative:
      "Hi Paul! Today you'll learn how to greet a neighbor politely and tell them your name in French.",
    introTarget:
      "Salut Paul ! Aujourd'hui, on apprend à dire bonjour et à se présenter en français.",
    outroNative:
      "Great job, Paul! You can now greet someone politely and introduce yourself in French. How do you feel about the lesson?",
    outroTarget:
      "Bravo Paul ! Tu sais maintenant dire bonjour et te présenter en français. Comment tu te sens ?",
    introNativeAudio: "foundation/usr_Paul/day1/intro_native.mp3",
    introTargetAudio: "foundation/usr_Paul/day1/intro_target.mp3",
    outroNativeAudio: "foundation/usr_Paul/day1/outro_native.mp3",
    outroTargetAudio: "foundation/usr_Paul/day1/outro_target.mp3",
    npcAudio: "foundation/usr_Paul/day1/npc.mp3",
    taughtChunks: ["Bonjour", "je suis", "enchanté"],
    blankedWords: ["suis", "enchanté", "Merci"],
    wrongAnswers: [
      "es",
      "est",
      "enchantée",
      "merci",
      "bonjour",
      "s'il vous plaît",
    ],
    pronunciationSound: "nasal on (ɔ̃)",
    listeningContrast:
      "daytime vs evening greeting, masculine vs feminine agreement, and first vs second person verb form",
    visualRequiredChunk: "enchanté",
    sceneDescription:
      "In the tidy hallway of your apartment building, a friendly neighbor you've never met greets you beside the potted plants and introduces herself.",
    freestylePersona:
      "a friendly neighbor you run into in the hallway of your apartment building",
    trueFalseStatement:
      "It's 9 p.m. and Paul runs into his neighbor in the hallway. He greets her with 'Bonjour' — that's the right greeting for the evening.",
    wordAudio: {
      bonjour: {
        m: "foundation/words/fr-FR/m/bonjour.mp3",
        f: "foundation/words/fr-FR/f/bonjour.mp3",
      },
      je: {
        m: "foundation/words/fr-FR/m/je.mp3",
        f: "foundation/words/fr-FR/f/je.mp3",
      },
      suis: {
        m: "foundation/words/fr-FR/m/suis.mp3",
        f: "foundation/words/fr-FR/f/suis.mp3",
      },
      paul: {
        m: "foundation/words/fr-FR/m/paul.mp3",
        f: "foundation/words/fr-FR/f/paul.mp3",
      },
      enchanté: {
        m: "foundation/words/fr-FR/m/enchanté.mp3",
        f: "foundation/words/fr-FR/f/enchanté.mp3",
      },
      es: {
        m: "foundation/words/fr-FR/m/es.mp3",
        f: "foundation/words/fr-FR/f/es.mp3",
      },
      est: {
        m: "foundation/words/fr-FR/m/est.mp3",
        f: "foundation/words/fr-FR/f/est.mp3",
      },
      enchantée: {
        m: "foundation/words/fr-FR/m/enchantée.mp3",
        f: "foundation/words/fr-FR/f/enchantée.mp3",
      },
      merci: {
        m: "foundation/words/fr-FR/m/merci.mp3",
        f: "foundation/words/fr-FR/f/merci.mp3",
      },
      beaucoup: {
        m: "foundation/words/fr-FR/m/beaucoup.mp3",
        f: "foundation/words/fr-FR/f/beaucoup.mp3",
      },
      monsieur: {
        m: "foundation/words/fr-FR/m/monsieur.mp3",
        f: "foundation/words/fr-FR/f/monsieur.mp3",
      },
      sil: {
        m: "foundation/words/fr-FR/m/sil.mp3",
        f: "foundation/words/fr-FR/f/sil.mp3",
      },
      vous: {
        m: "foundation/words/fr-FR/m/vous.mp3",
        f: "foundation/words/fr-FR/f/vous.mp3",
      },
      plaît: {
        m: "foundation/words/fr-FR/m/plaît.mp3",
        f: "foundation/words/fr-FR/f/plaît.mp3",
      },
      bonsoir: {
        m: "foundation/words/fr-FR/m/bonsoir.mp3",
        f: "foundation/words/fr-FR/f/bonsoir.mp3",
      },
      sont: {
        m: "foundation/words/fr-FR/m/sont.mp3",
        f: "foundation/words/fr-FR/f/sont.mp3",
      },
      moi: {
        m: "foundation/words/fr-FR/m/moi.mp3",
        f: "foundation/words/fr-FR/f/moi.mp3",
      },
      cest: {
        m: "foundation/words/fr-FR/m/cest.mp3",
        f: "foundation/words/fr-FR/f/cest.mp3",
      },
      madame: {
        m: "foundation/words/fr-FR/m/madame.mp3",
        f: "foundation/words/fr-FR/f/madame.mp3",
      },
      laurent: {
        m: "foundation/words/fr-FR/m/laurent.mp3",
        f: "foundation/words/fr-FR/f/laurent.mp3",
      },
      votre: {
        m: "foundation/words/fr-FR/m/votre.mp3",
        f: "foundation/words/fr-FR/f/votre.mp3",
      },
      voisine: {
        m: "foundation/words/fr-FR/m/voisine.mp3",
        f: "foundation/words/fr-FR/f/voisine.mp3",
      },
      du: {
        m: "foundation/words/fr-FR/m/du.mp3",
        f: "foundation/words/fr-FR/f/du.mp3",
      },
      troisième: {
        m: "foundation/words/fr-FR/m/troisième.mp3",
        f: "foundation/words/fr-FR/f/troisième.mp3",
      },
      étage: {
        m: "foundation/words/fr-FR/m/étage.mp3",
        f: "foundation/words/fr-FR/f/étage.mp3",
      },
      de: {
        m: "foundation/words/fr-FR/m/de.mp3",
        f: "foundation/words/fr-FR/f/de.mp3",
      },
      faire: {
        m: "foundation/words/fr-FR/m/faire.mp3",
        f: "foundation/words/fr-FR/f/faire.mp3",
      },
      connaissance: {
        m: "foundation/words/fr-FR/m/connaissance.mp3",
        f: "foundation/words/fr-FR/f/connaissance.mp3",
      },
      viens: {
        m: "foundation/words/fr-FR/m/viens.mp3",
        f: "foundation/words/fr-FR/f/viens.mp3",
      },
      demménager: {
        m: "foundation/words/fr-FR/m/demménager.mp3",
        f: "foundation/words/fr-FR/f/demménager.mp3",
      },
      ici: {
        m: "foundation/words/fr-FR/m/ici.mp3",
        f: "foundation/words/fr-FR/f/ici.mp3",
      },
      salut: {
        m: "foundation/words/fr-FR/m/salut.mp3",
        f: "foundation/words/fr-FR/f/salut.mp3",
      },
      aujourdhui: {
        m: "foundation/words/fr-FR/m/aujourdhui.mp3",
        f: "foundation/words/fr-FR/f/aujourdhui.mp3",
      },
      on: {
        m: "foundation/words/fr-FR/m/on.mp3",
        f: "foundation/words/fr-FR/f/on.mp3",
      },
      apprend: {
        m: "foundation/words/fr-FR/m/apprend.mp3",
        f: "foundation/words/fr-FR/f/apprend.mp3",
      },
      à: {
        m: "foundation/words/fr-FR/m/à.mp3",
        f: "foundation/words/fr-FR/f/à.mp3",
      },
      dire: {
        m: "foundation/words/fr-FR/m/dire.mp3",
        f: "foundation/words/fr-FR/f/dire.mp3",
      },
      et: {
        m: "foundation/words/fr-FR/m/et.mp3",
        f: "foundation/words/fr-FR/f/et.mp3",
      },
      se: {
        m: "foundation/words/fr-FR/m/se.mp3",
        f: "foundation/words/fr-FR/f/se.mp3",
      },
      présenter: {
        m: "foundation/words/fr-FR/m/présenter.mp3",
        f: "foundation/words/fr-FR/f/présenter.mp3",
      },
      en: {
        m: "foundation/words/fr-FR/m/en.mp3",
        f: "foundation/words/fr-FR/f/en.mp3",
      },
      français: {
        m: "foundation/words/fr-FR/m/français.mp3",
        f: "foundation/words/fr-FR/f/français.mp3",
      },
      bravo: {
        m: "foundation/words/fr-FR/m/bravo.mp3",
        f: "foundation/words/fr-FR/f/bravo.mp3",
      },
      tu: {
        m: "foundation/words/fr-FR/m/tu.mp3",
        f: "foundation/words/fr-FR/f/tu.mp3",
      },
      sais: {
        m: "foundation/words/fr-FR/m/sais.mp3",
        f: "foundation/words/fr-FR/f/sais.mp3",
      },
      maintenant: {
        m: "foundation/words/fr-FR/m/maintenant.mp3",
        f: "foundation/words/fr-FR/f/maintenant.mp3",
      },
      te: {
        m: "foundation/words/fr-FR/m/te.mp3",
        f: "foundation/words/fr-FR/f/te.mp3",
      },
      comment: {
        m: "foundation/words/fr-FR/m/comment.mp3",
        f: "foundation/words/fr-FR/f/comment.mp3",
      },
      sens: {
        m: "foundation/words/fr-FR/m/sens.mp3",
        f: "foundation/words/fr-FR/f/sens.mp3",
      },
    },
  },
};

export const MOCK_FOUNDATION_DATA_EN_ES = {
  userId: "usr_anna",
  foundationCourseId: "course_test",
  name: "Anna",
  orderIndex: 1,
  nativeLang: "en-US",
  targetLang: "es-ES",
  status: "ready",
  visualContent: {
    imageS3Key: "foundation/usr_anna/day1/visual.png",
    npcAudioS3Key: "foundation/usr_anna/day1/npc.mp3",
    sceneDescription:
      "In the tidy hallway of your apartment building, a neighbor you have never met greets you in the afternoon beside the potted plants by her door.",
    altText:
      "A tidy apartment hallway with light walls, wooden doors, and several potted plants lined along the floor. A smiling woman in her forties stands by one of the doors, extending her hand in greeting toward the viewer.",
    npcLine: "¡Hola! ¿Eres la nueva vecina del 4A? Yo soy Carmen, la del 3B.",
    constraint: {
      requiredChunk: "encantada de conocerte",
      validReplies: [
        "Sí, soy la nueva vecina, encantada de conocerte.",
        "Sí, encantada de conocerte. Vivo en el 4A.",
        "Claro, encantada de conocerte.",
      ],
    },
  },
  grammarContent: {
    targetSentence: "Buenas tardes. Soy Anna. Encantada de conocerte.",
    nativeSentence: "Good afternoon. I'm Anna. Nice to meet you.",
    romanizedSentence: null,
    words: [
      {
        word: "Buenas",
        gloss: "good (feminine plural, part of the greeting)",
        role: "interjection",
      },
      {
        word: "tardes",
        gloss: "afternoons (with 'buenas' = good afternoon)",
        role: "interjection",
      },
      {
        word: "Soy",
        gloss: "I am",
        role: "verb",
      },
      {
        word: "Anna",
        gloss: "Anna (the speaker's name)",
        role: "name",
      },
      {
        word: "encantada",
        gloss: "delighted (feminine form)",
        role: "adjective",
      },
      {
        word: "de",
        gloss: "to (links 'delighted' with 'to meet you')",
        role: "connector",
      },
      {
        word: "conocerte",
        gloss: "to meet you",
        role: "verb",
      },
    ],
    highlightGroup: ["Buenas tardes", "Soy Anna", "encantada de conocerte"],
    clozeItems: [
      {
        id: "cloze-1",
        hostSentence: "Buenas tardes. Soy Anna. Encantada de conocerte.",
        blankPosition: 2,
        acceptableAnswers: ["Soy", "soy"],
        wrongAnswerFeedback: [
          {
            wrong: "Es",
            feedback:
              "'Es' is for other people; use 'Soy' when you give your own name.",
          },
          {
            wrong: "Estoy",
            feedback: "Names go with 'soy', not 'estoy' — say 'Soy Anna'.",
          },
        ],
      },
      {
        id: "cloze-2",
        hostSentence: "Buenas tardes. Soy Anna. Encantada de conocerte.",
        blankPosition: 4,
        acceptableAnswers: ["Encantada", "encantada"],
        wrongAnswerFeedback: [
          {
            wrong: "Encantado",
            feedback:
              "You are the speaker (Anna), so use the feminine form 'Encantada'.",
          },
          {
            wrong: "Mucho",
            feedback:
              "'Mucho' belongs to 'mucho gusto'; this phrase is 'Encantada de conocerte'.",
          },
        ],
      },
      {
        id: "cloze-3",
        hostSentence: "Buenos días, señora.",
        blankPosition: 1,
        acceptableAnswers: ["días", "dias"],
        wrongAnswerFeedback: [
          {
            wrong: "tardes",
            feedback:
              "'Tardes' pairs with 'buenas'; with 'Buenos' the greeting is 'buenos días'.",
          },
          {
            wrong: "noches",
            feedback:
              "'Noches' takes 'buenas' — 'buenas noches'. Here 'Buenos' signals 'días'.",
          },
        ],
      },
    ],
  },
  pronunciationData: {
    referenceText: "Buenas tardes. Soy Anna. Encantada de conocerte.",
    audioS3Key: "foundation/usr_anna/day1/pronunciation.mp3",
    breakdown: [
      {
        text: "Buenas",
        phonetic: "ˈbwe.nas",
        hint: null,
      },
      {
        text: "tardes",
        phonetic: "ˈtar.des",
        hint: "The 'r' is one quick tap, like the 'tt' in the American English 'butter' — not the English 'r'.",
      },
      {
        text: "Soy",
        phonetic: "ˈsoj",
        hint: null,
      },
      {
        text: "Anna",
        phonetic: "ˈa.na",
        hint: null,
      },
      {
        text: "Encantada",
        phonetic: "en.kan.ˈta.ða",
        hint: "The 'd' between vowels is soft, like the 'th' in 'this'.",
      },
      {
        text: "de",
        phonetic: "ðe",
        hint: null,
      },
      {
        text: "conocerte",
        phonetic: "ko.no.ˈθer.te",
        hint: "The 'r' here is the same quick tap as in 'tardes'.",
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
    referenceText: "Buenas tardes. Soy Anna. Encantada de conocerte.",
    audioS3Key: "foundation/usr_anna/day1/listening.mp3",
    expectedOrder: [
      "Buenas",
      "tardes",
      "Soy",
      "Anna",
      "Encantada",
      "de",
      "conocerte",
    ],
    wordBank: [
      "Anna",
      "eres",
      "tardes",
      "Soy",
      "de",
      "Encantada",
      "conocerte",
      "Buenas",
      "encantado",
      "noches",
    ],
    contrast:
      "afternoon vs evening greeting; feminine vs masculine form; yo vs tú verb form",
  },
  quizContent: {
    items: [
      {
        type: "verbal_cloze",
        prompt: "Buenas ___. Soy Anna. Encantada de conocerte.",
        hint: "The part of the day after noon (this greeting uses the plural form)",
        acceptableAnswers: ["tardes", "Tardes"],
        feedback:
          "Use 'tardes' — 'Buenas tardes' is the fixed greeting for 'Good afternoon'.",
      },
      {
        type: "reorder",
        prompt: "Translate: 'Good afternoon. I'm Anna. Nice to meet you.'",
        expectedWords: [
          "Buenas",
          "tardes.",
          "Soy",
          "Anna.",
          "Encantada",
          "de",
          "conocerte.",
        ],
        scrambledBank: [
          "tardes.",
          "Buenas",
          "encantado",
          "conocerte.",
          "Soy",
          "Anna.",
          "Encantada",
          "buenos",
          "noches",
          "de",
        ],
      },
      {
        type: "true_false",
        statement:
          "It's 9 in the morning, and Anna greets her neighbor with 'Buenas tardes.'",
        isTrue: false,
        explanation:
          "In the morning, say 'Buenos días'; 'Buenas tardes' is only for the afternoon.",
      },
      {
        type: "verbal_cloze",
        prompt: "Buenas tardes. ___ Anna. Encantada de conocerte.",
        hint: "The polite one-word way to say 'I am' before your name",
        acceptableAnswers: ["soy", "Soy"],
        feedback:
          "Use 'Soy' — the polite chunk for 'I am' when giving your name.",
      },
    ],
    passThreshold: 0.7,
  },
  freestyle: {
    mode: "SPECIFIC",
    level: "ZERO",
    topic: "Greetings and Introductions",
    persona: "a friendly neighbor in the lobby of your apartment building",
    requiredChunks: ["Buenos días", "Encantada de conocerte", "Soy ..."],
    openingLine:
      "Anna, it's morning and you run into a neighbor in your building's lobby — greet them for the time of day, tell them your name, and say 'nice to meet you', replying in Spanish.",
  },
  lessonHandoff: {
    day: 1,
    theme: "Greetings and Names",
    targetSentence: "Buenas tardes. Soy Anna. Encantada de conocerte.",
    chunks: [
      "hola / buenas tardes",
      "buenos días",
      "buenas noches",
      "encantado de conocerte / mucho gusto",
      "gracias",
      "polite name statement (I am / my name is — polite form)",
      "please call me [name]",
    ],
    npcLine: "¡Hola! ¿Eres la nueva vecina del 4A? Yo soy Carmen, la del 3B.",
    freestyleTopic: "Greetings and Introductions",
    introNative:
      "Hi Anna! Today you'll learn how to greet a neighbor in Spanish and introduce yourself politely, just like you'd do in the hallway of your building in Spain.",
    introTarget:
      "¡Hola, Anna! Hoy aprendemos a saludar y a decir tu nombre en español.",
    outroNative:
      "Great job, Anna! You can now greet someone by the time of day and introduce yourself in Spanish. How do you feel about today's lesson?",
    outroTarget:
      "¡Muy bien, Anna! Ya sabes saludar y dar tu nombre en español. ¿Cómo te sientes con la lección de hoy?",
    introNativeAudio: "foundation/usr_anna/day1/intro_native.mp3",
    introTargetAudio: "foundation/usr_anna/day1/intro_target.mp3",
    outroNativeAudio: "foundation/usr_anna/day1/outro_native.mp3",
    outroTargetAudio: "foundation/usr_anna/day1/outro_target.mp3",
    npcAudio: "foundation/usr_anna/day1/npc.mp3",
    taughtChunks: ["Buenas tardes", "Soy Anna", "encantada de conocerte"],
    blankedWords: ["Soy", "Encantada", "días", "tardes"],
    wrongAnswers: ["Es", "Estoy", "Encantado", "Mucho", "tardes", "noches"],
    pronunciationSound: "soft r",
    listeningContrast:
      "afternoon vs evening greeting; feminine vs masculine form; yo vs tú verb form",
    visualRequiredChunk: "encantada de conocerte",
    sceneDescription:
      "In the tidy hallway of your apartment building, a neighbor you have never met greets you in the afternoon beside the potted plants by her door.",
    freestylePersona:
      "a friendly neighbor in the lobby of your apartment building",
    trueFalseStatement:
      "It's 9 in the morning, and Anna greets her neighbor with 'Buenas tardes.'",
    wordAudio: {
      buenas: {
        m: "foundation/words/es-ES/m/buenas.mp3",
        f: "foundation/words/es-ES/f/buenas.mp3",
      },
      tardes: {
        m: "foundation/words/es-ES/m/tardes.mp3",
        f: "foundation/words/es-ES/f/tardes.mp3",
      },
      soy: {
        m: "foundation/words/es-ES/m/soy.mp3",
        f: "foundation/words/es-ES/f/soy.mp3",
      },
      anna: {
        m: "foundation/words/es-ES/m/anna.mp3",
        f: "foundation/words/es-ES/f/anna.mp3",
      },
      encantada: {
        m: "foundation/words/es-ES/m/encantada.mp3",
        f: "foundation/words/es-ES/f/encantada.mp3",
      },
      de: {
        m: "foundation/words/es-ES/m/de.mp3",
        f: "foundation/words/es-ES/f/de.mp3",
      },
      conocerte: {
        m: "foundation/words/es-ES/m/conocerte.mp3",
        f: "foundation/words/es-ES/f/conocerte.mp3",
      },
      es: {
        m: "foundation/words/es-ES/m/es.mp3",
        f: "foundation/words/es-ES/f/es.mp3",
      },
      estoy: {
        m: "foundation/words/es-ES/m/estoy.mp3",
        f: "foundation/words/es-ES/f/estoy.mp3",
      },
      encantado: {
        m: "foundation/words/es-ES/m/encantado.mp3",
        f: "foundation/words/es-ES/f/encantado.mp3",
      },
      mucho: {
        m: "foundation/words/es-ES/m/mucho.mp3",
        f: "foundation/words/es-ES/f/mucho.mp3",
      },
      buenos: {
        m: "foundation/words/es-ES/m/buenos.mp3",
        f: "foundation/words/es-ES/f/buenos.mp3",
      },
      días: {
        m: "foundation/words/es-ES/m/días.mp3",
        f: "foundation/words/es-ES/f/días.mp3",
      },
      señora: {
        m: "foundation/words/es-ES/m/señora.mp3",
        f: "foundation/words/es-ES/f/señora.mp3",
      },
      dias: {
        m: "foundation/words/es-ES/m/dias.mp3",
        f: "foundation/words/es-ES/f/dias.mp3",
      },
      noches: {
        m: "foundation/words/es-ES/m/noches.mp3",
        f: "foundation/words/es-ES/f/noches.mp3",
      },
      eres: {
        m: "foundation/words/es-ES/m/eres.mp3",
        f: "foundation/words/es-ES/f/eres.mp3",
      },
      hola: {
        m: "foundation/words/es-ES/m/hola.mp3",
        f: "foundation/words/es-ES/f/hola.mp3",
      },
      la: {
        m: "foundation/words/es-ES/m/la.mp3",
        f: "foundation/words/es-ES/f/la.mp3",
      },
      nueva: {
        m: "foundation/words/es-ES/m/nueva.mp3",
        f: "foundation/words/es-ES/f/nueva.mp3",
      },
      vecina: {
        m: "foundation/words/es-ES/m/vecina.mp3",
        f: "foundation/words/es-ES/f/vecina.mp3",
      },
      del: {
        m: "foundation/words/es-ES/m/del.mp3",
        f: "foundation/words/es-ES/f/del.mp3",
      },
      "4a": {
        m: "foundation/words/es-ES/m/4a.mp3",
        f: "foundation/words/es-ES/f/4a.mp3",
      },
      yo: {
        m: "foundation/words/es-ES/m/yo.mp3",
        f: "foundation/words/es-ES/f/yo.mp3",
      },
      carmen: {
        m: "foundation/words/es-ES/m/carmen.mp3",
        f: "foundation/words/es-ES/f/carmen.mp3",
      },
      "3b": {
        m: "foundation/words/es-ES/m/3b.mp3",
        f: "foundation/words/es-ES/f/3b.mp3",
      },
      sí: {
        m: "foundation/words/es-ES/m/sí.mp3",
        f: "foundation/words/es-ES/f/sí.mp3",
      },
      vivo: {
        m: "foundation/words/es-ES/m/vivo.mp3",
        f: "foundation/words/es-ES/f/vivo.mp3",
      },
      en: {
        m: "foundation/words/es-ES/m/en.mp3",
        f: "foundation/words/es-ES/f/en.mp3",
      },
      el: {
        m: "foundation/words/es-ES/m/el.mp3",
        f: "foundation/words/es-ES/f/el.mp3",
      },
      claro: {
        m: "foundation/words/es-ES/m/claro.mp3",
        f: "foundation/words/es-ES/f/claro.mp3",
      },
      hoy: {
        m: "foundation/words/es-ES/m/hoy.mp3",
        f: "foundation/words/es-ES/f/hoy.mp3",
      },
      aprendemos: {
        m: "foundation/words/es-ES/m/aprendemos.mp3",
        f: "foundation/words/es-ES/f/aprendemos.mp3",
      },
      a: {
        m: "foundation/words/es-ES/m/a.mp3",
        f: "foundation/words/es-ES/f/a.mp3",
      },
      saludar: {
        m: "foundation/words/es-ES/m/saludar.mp3",
        f: "foundation/words/es-ES/f/saludar.mp3",
      },
      y: {
        m: "foundation/words/es-ES/m/y.mp3",
        f: "foundation/words/es-ES/f/y.mp3",
      },
      decir: {
        m: "foundation/words/es-ES/m/decir.mp3",
        f: "foundation/words/es-ES/f/decir.mp3",
      },
      tu: {
        m: "foundation/words/es-ES/m/tu.mp3",
        f: "foundation/words/es-ES/f/tu.mp3",
      },
      nombre: {
        m: "foundation/words/es-ES/m/nombre.mp3",
        f: "foundation/words/es-ES/f/nombre.mp3",
      },
      español: {
        m: "foundation/words/es-ES/m/español.mp3",
        f: "foundation/words/es-ES/f/español.mp3",
      },
      muy: {
        m: "foundation/words/es-ES/m/muy.mp3",
        f: "foundation/words/es-ES/f/muy.mp3",
      },
      bien: {
        m: "foundation/words/es-ES/m/bien.mp3",
        f: "foundation/words/es-ES/f/bien.mp3",
      },
      ya: {
        m: "foundation/words/es-ES/m/ya.mp3",
        f: "foundation/words/es-ES/f/ya.mp3",
      },
      sabes: {
        m: "foundation/words/es-ES/m/sabes.mp3",
        f: "foundation/words/es-ES/f/sabes.mp3",
      },
      dar: {
        m: "foundation/words/es-ES/m/dar.mp3",
        f: "foundation/words/es-ES/f/dar.mp3",
      },
      cómo: {
        m: "foundation/words/es-ES/m/cómo.mp3",
        f: "foundation/words/es-ES/f/cómo.mp3",
      },
      te: {
        m: "foundation/words/es-ES/m/te.mp3",
        f: "foundation/words/es-ES/f/te.mp3",
      },
      sientes: {
        m: "foundation/words/es-ES/m/sientes.mp3",
        f: "foundation/words/es-ES/f/sientes.mp3",
      },
      con: {
        m: "foundation/words/es-ES/m/con.mp3",
        f: "foundation/words/es-ES/f/con.mp3",
      },
      lección: {
        m: "foundation/words/es-ES/m/lección.mp3",
        f: "foundation/words/es-ES/f/lección.mp3",
      },
    },
  },
};


export const MOCK_FOUNDATION_DATA_EN_ES_V0 = {
  userId: "usr_annalia",
  name: "Annalia",
  foundationCourseId: "course_test",
  orderIndex: 1,
  status: "ready",
  nativeLang: "en-US", // <--- ADD THIS
  targetLang: "es-Es", // <--- ADD THIS
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
    persona:
      "a friendly neighbor in the entrance hall of your apartment building",
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
    wrongAnswers: [
      "Es",
      "Estoy",
      "Encantada",
      "Encantados",
      "gracia",
      "buenas",
    ],
    pronunciationSound: "soft r",
    listeningContrast:
      "afternoon vs evening greeting and masculine vs feminine form",
    visualRequiredChunk: "Encantado de conocerte",
    sceneDescription:
      "In the tidy hallway of your apartment building, a friendly neighbor standing near the potted plants by her door greets you and introduces herself as the new resident.",
    freestylePersona:
      "a friendly neighbor in the entrance hall of your apartment building",
    trueFalseStatement:
      "It's 9 in the morning and Anna-leah greets his neighbor with 'Buenas tardes.'",
  },
};
