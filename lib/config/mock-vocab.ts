// NOTE ON SCOPE: this payload is a different lesson type than the old
// MOCK_FOUNDATION_DATA. It's not a "foundation" lesson (grammar breakdown +
// pronunciation breakdown + listening reorder + fixed quiz + freestyle
// roleplay) — it's a "bridge" lesson (vocab intro + a mixed-mechanic drill
// set called "cooldown"). Several old sections don't exist here at all, and
// a couple of new ones show up. Named it MOCK_BRIDGE_DATA since that matches
// the payload's own vocabulary (bridgeScene, bridgeIndex, bridgeAssets,
// bridgeLexicon) — rename if you've got a different convention.

export const MOCK_BRIDGE_DATA_EN_FR = {
  meta: {
    userId: "usr_paul",
    courseId: "course_test",
    bridgeIndex: 1,
    nativeLanguage: "en-US",
    targetLanguage: "fr-FR",
    firstName: "Paul",
    gender: "male",
  },

  bridgeScene: {
    imageS3Key: "foundation/usr_paul/day1/visual.png",
    npcAudioS3Key:
      "vocab/en-US_fr-FR/nodes/A1_greetings_and_names/95ab54d7eb/npc.mp3",
    npcLine: "Bonjour ! Je suis Marie, votre nouvelle voisine.",
    altText: "Scene about Greetings and Names",
    videoS3Key:
      "vocab/en-US_fr-FR/nodes/A1_greetings_and_names/95ab54d7eb/scene_animated.mp4",
  },

  vocabMoment: [
    {
      word: "la voisine",
      gloss: "the neighbor",
      audioS3Key:
        "vocab/en-US_fr-FR/nodes/A1_greetings_and_names/95ab54d7eb/vocab_0.mp3",
      labelHint: "la voisine",
    },
    {
      word: "le couloir",
      gloss: "the hallway",
      audioS3Key:
        "vocab/en-US_fr-FR/nodes/A1_greetings_and_names/95ab54d7eb/vocab_1.mp3",
      labelHint: "le couloir",
    },
  ],

  // Discriminated union keyed on "mechanic".
  // NOTE: "correct" is an array for word_coupling but a string for context_clash.
  // NOTE: itemId is "" on every item; video_spotlight has no correct/feedback.
  cooldown: [
    {
      mechanic: "word_coupling",
      pillar: "lexical",
      provenance: {
        nodeId: "A1_greetings_and_names",
        sourceChunkIds: ["Bonjour"],
        pillar: "lexical",
        mechanic: "word_coupling",
      },
      itemId: "",
      contextNative:
        "You run into a woman in the hallway of your new apartment building. She lives right next door — she's your new neighbor.",
      instructionNative: "What do you say to her first?",
      targetWord: "la voisine",
      options: ["Bonjour", "le couloir", "Merci"],
      correct: ["Bonjour"],
      feedback: {
        "le couloir":
          "That's the hallway — the place you're both standing in, not something you say to her.",
        Merci:
          "'Merci' is for saying thank you — you'd use it after she helps you with something, not as a first greeting.",
      },
    },
    {
      mechanic: "variable_shift",
      pillar: "morphosyntax",
      provenance: {
        nodeId: "A1_greetings_and_names",
        sourceChunkIds: ["Bonjour"],
        pillar: "morphosyntax",
        mechanic: "variable_shift",
      },
      itemId: "",
      baseSentence: "Bonjour. Enchanté. Je suis Paul.",
      contextNative:
        "That evening, your neighbor introduces you to her husband in the hallway. It's the first time you're meeting him.",
      instructionNative: "What do you say to him?",
      expected: ["Bonsoir. Enchanté. Je suis Paul."],
      expectedFolds: ["bonsoir. enchante. je suis paul"],
      rejectFeedback: {
        "Bonjour. Enchanté. Je suis Paul.":
          "It's evening now, so 'Bonjour' doesn't fit — start with the evening greeting instead.",
        "Bonsoir. Enchantée. Je suis Paul.":
          "Paul is the one speaking, and he's a man, so 'Enchanté' keeps the same form with no extra -e.",
        "Bonsoir. Je suis Paul.":
          "You're meeting him for the first time, so keep 'Enchanté' in your introduction.",
      },
    },
    {
      mechanic: "context_clash",
      pillar: "pragmatic",
      provenance: {
        nodeId: "A1_greetings_and_names",
        sourceChunkIds: ["Bonjour"],
        pillar: "pragmatic",
        mechanic: "context_clash",
      },
      itemId: "",
      contextNative:
        "It's eight in the morning, and you're carrying a box down the hallway of your new apartment building. You pass the woman from the apartment across the hall — your new neighbor — and she looks up at you.",
      instructionNative: "Which greeting is most appropriate to say to her?",
      options: ["Bonjour, madame.", "Bonsoir, madame.", "Salut ! Ça va ?"],
      // NOTE: string here, not an array
      correct: "Bonjour, madame.",
      feedback: {
        "Salut ! Ça va ?":
          "'Salut' signals to a French speaker that you two are already close friends — with a neighbor you've never spoken to, it comes across as too familiar. Open with 'Bonjour, madame' and save the casual greetings for once you know each other.",
        "Bonsoir, madame.":
          "'Bonsoir' is the evening greeting; using it on a morning in the hallway sounds odd to a native ear. At this time of day, say 'Bonjour, madame.'",
      },
    },
    {
      mechanic: "video_spotlight",
      pillar: "lexical",
      provenance: {
        nodeId: "A1_greetings_and_names",
        sourceChunkIds: ["Bonjour", "Enchanté", "Je", "suis"],
        pillar: "lexical",
        mechanic: "video_spotlight",
      },
      itemId: "",
      videoS3Key:
        "vocab/en-US_fr-FR/nodes/A1_greetings_and_names/95ab54d7eb/scene_animated.mp4",
      targetAudioS3Key:
        "vocab/en-US_fr-FR/nodes/A1_greetings_and_names/95ab54d7eb/vocab_1.mp3",
      targetWord: "le couloir",
      contextNative: "Watch the scene carefully.",
      instructionNative: "Where does the neighbor stop you?",
      options: ["l'ascenseur", "la voisine", "le couloir"],
      // NOTE: no "correct" or "feedback" — targetWord is the answer.
    },
  ],

  pronunciationCheck: {
    referenceText: "Bonjour. Enchanté. Je suis Paul.",
    engine: "azure",
    focusSounds: [
      {
        sound: "nasal on (ɔ̃)",
        positions: [0],
      },
    ],
  },

  handoffFragment: {
    primedChunks: [],
    lingeringWeaknesses: [],
    bridgeAssets: {
      imageS3Key: "foundation/usr_paul/day1/visual.png",
      npcAudioS3Key:
        "vocab/en-US_fr-FR/nodes/A1_greetings_and_names/95ab54d7eb/npc.mp3",
      vocabMomentAudio: [
        "vocab/en-US_fr-FR/nodes/A1_greetings_and_names/95ab54d7eb/vocab_0.mp3",
        "vocab/en-US_fr-FR/nodes/A1_greetings_and_names/95ab54d7eb/vocab_1.mp3",
      ],
      videoS3Key:
        "vocab/en-US_fr-FR/nodes/A1_greetings_and_names/95ab54d7eb/scene_animated.mp4",
    },
    unlockNext: true,
    bridgeLexicon: ["la voisine", "le couloir"],
    usedShiftIds: [],
  },
};

export const MOCK_BRIDGE_DATA_EN_ES = {
  meta: {
    userId: "usr_annalia",
    courseId: "course_test",
    bridgeIndex: 1,
    nativeLanguage: "en-US",
    targetLanguage: "es-ES",
    firstName: "Anna-leah",
    gender: "male",
  },

  bridgeScene: {
    imageS3Key: "foundation/usr_annalia/day1/visual.png",
    npcAudioS3Key:
      "vocab/en-US_es-ES/nodes/A1_greetings_and_names/71f99d21ac/npc.mp3",
    npcLine:
      "¡Buenas tardes! Soy Carmen, la vecina nueva del 3B. Encantada de conocerte.",
    altText: "Scene about Greetings and Names",
    videoS3Key:
      "vocab/en-US_es-ES/nodes/A1_greetings_and_names/71f99d21ac/scene_animated.mp4",
  },

  vocabMoment: [
    {
      word: "la vecina",
      gloss: "the neighbor",
      audioS3Key:
        "vocab/en-US_es-ES/nodes/A1_greetings_and_names/71f99d21ac/vocab_0.mp3",
      labelHint: "la vecina",
    },
    {
      word: "el pasillo",
      gloss: "the hallway",
      audioS3Key:
        "vocab/en-US_es-ES/nodes/A1_greetings_and_names/71f99d21ac/vocab_1.mp3",
      labelHint: "el pasillo",
    },
    {
      word: "las plantas",
      gloss: "the plants",
      audioS3Key:
        "vocab/en-US_es-ES/nodes/A1_greetings_and_names/71f99d21ac/vocab_2.mp3",
      labelHint: "las plantas",
    },
  ],

  // Discriminated union keyed on "mechanic".
  // NOTE: "correct" is an array for word_coupling but a string for context_clash.
  // NOTE: itemId is "" on every item; video_spotlight has no correct/feedback.
  cooldown: [
    {
      mechanic: "word_coupling",
      pillar: "lexical",
      provenance: {
        nodeId: "A1_greetings_and_names",
        sourceChunkIds: ["Buenas"],
        pillar: "lexical",
        mechanic: "word_coupling",
      },
      itemId: "",
      contextNative:
        "It is late afternoon in your apartment building. You pass your neighbor in the hallway, next to the plants by her door, and you want to greet her.",
      instructionNative: "What do you say to her first?",
      targetWord: "la vecina",
      options: ["Buenas", "el pasillo", "las plantas"],
      correct: ["Buenas"],
      feedback: {
        "el pasillo":
          "That's the hallway — the place where you're standing, not something you say to her.",
        "las plantas":
          "Those are the plants by her door, not a way to greet someone.",
      },
    },
    {
      mechanic: "variable_shift",
      pillar: "morphosyntax",
      provenance: {
        nodeId: "A1_greetings_and_names",
        sourceChunkIds: ["Buenas"],
        pillar: "morphosyntax",
        mechanic: "variable_shift",
      },
      itemId: "",
      baseSentence: "Buenas tardes. Soy Anna-leah. Encantado de conocerte.",
      contextNative:
        "The next morning, you meet a new neighbor carrying boxes in the hallway. You have never spoken before, and you want to introduce yourself.",
      instructionNative: "What do you say to introduce yourself?",
      expected: ["Buenas. Soy Anna-leah. Encantado de conocerte."],
      expectedFolds: ["buenas. soy anna-leah. encantado de conocerte"],
      rejectFeedback: {
        "Buenas tardes. Soy Anna-leah. Encantado de conocerte.":
          "It's morning now, so the afternoon greeting 'buenas tardes' doesn't fit — that's the only thing that should change.",
        "Buenos días. Soy Anna-leah. Encantado de conocerte.":
          "Good instinct for the morning, but 'buenos días' wasn't in today's lesson — use the greeting you already know.",
        "Buenas.":
          "That's a friendly start, but she doesn't know your name yet — introduce yourself too.",
      },
    },
    {
      mechanic: "context_clash",
      pillar: "pragmatic",
      provenance: {
        nodeId: "A1_greetings_and_names",
        sourceChunkIds: ["Buenas"],
        pillar: "pragmatic",
        mechanic: "context_clash",
      },
      itemId: "",
      contextNative:
        "You moved into this building last week, and it's late afternoon as you carry your shopping up to your apartment. In the hallway, your neighbor — the woman with all the plants — smiles at you, and you finally get the chance to introduce yourself.",
      instructionNative: "Which greeting is most appropriate here?",
      options: [
        "Buenas tardes, encantado de conocerte.",
        "¡Hola, tía! ¿Qué pasa?",
        "Buenas noches, encantado de conocerte.",
      ],
      // NOTE: string here, not an array
      correct: "Buenas tardes, encantado de conocerte.",
      feedback: {
        "Buenas noches, encantado de conocerte.":
          "«Buenas noches» is for the evening or nighttime. Since it's the afternoon, it would sound odd to her — «buenas tardes» is what she'd expect.",
        "¡Hola, tía! ¿Qué pasa?":
          "«Tía» is what close friends call each other in Spain. To a neighbor you've never spoken to, it sounds overly familiar — a friendly «buenas tardes» hits the right note.",
      },
    },
    {
      mechanic: "video_spotlight",
      pillar: "lexical",
      provenance: {
        nodeId: "A1_greetings_and_names",
        sourceChunkIds: [
          "Buenas",
          "tardes",
          "Soy",
          "Encantado",
          "de",
          "conocerte",
        ],
        pillar: "lexical",
        mechanic: "video_spotlight",
      },
      itemId: "",
      videoS3Key:
        "vocab/en-US_es-ES/nodes/A1_greetings_and_names/71f99d21ac/scene_animated.mp4",
      targetAudioS3Key:
        "vocab/en-US_es-ES/nodes/A1_greetings_and_names/71f99d21ac/vocab_0.mp3",
      targetWord: "la vecina",
      contextNative: "Watch the scene carefully.",
      instructionNative: "Who greets you in the hallway?",
      options: ["la vecina", "el pasillo", "las plantas"],
      // NOTE: no "correct" or "feedback" — targetWord is the answer.
    },
  ],

  pronunciationCheck: {
    referenceText: "Buenas tardes. Soy Anna-leah. Encantado de conocerte.",
    engine: "azure",
    focusSounds: [
      {
        sound: "soft r",
        positions: [7],
      },
    ],
  },

  handoffFragment: {
    primedChunks: [],
    lingeringWeaknesses: [],
    bridgeAssets: {
      imageS3Key: "foundation/usr_annalia/day1/visual.png",
      npcAudioS3Key:
        "vocab/en-US_es-ES/nodes/A1_greetings_and_names/71f99d21ac/npc.mp3",
      vocabMomentAudio: [
        "vocab/en-US_es-ES/nodes/A1_greetings_and_names/71f99d21ac/vocab_0.mp3",
        "vocab/en-US_es-ES/nodes/A1_greetings_and_names/71f99d21ac/vocab_1.mp3",
        "vocab/en-US_es-ES/nodes/A1_greetings_and_names/71f99d21ac/vocab_2.mp3",
      ],
      videoS3Key:
        "vocab/en-US_es-ES/nodes/A1_greetings_and_names/71f99d21ac/scene_animated.mp4",
    },
    unlockNext: true,
    bridgeLexicon: ["la vecina", "el pasillo", "las plantas"],
    usedShiftIds: [],
  },
};