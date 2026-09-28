// NOTE ON SCOPE: this payload is a different lesson type than the old
// MOCK_FOUNDATION_DATA. It's not a "foundation" lesson (grammar breakdown +
// pronunciation breakdown + listening reorder + fixed quiz + freestyle
// roleplay) — it's a "bridge" lesson (vocab intro + a mixed-mechanic drill
// set called "cooldown"). Several old sections don't exist here at all, and
// a couple of new ones show up. Named it MOCK_BRIDGE_DATA since that matches
// the payload's own vocabulary (bridgeScene, bridgeIndex, bridgeAssets,
// bridgeLexicon) — rename if you've got a different convention.

export const MOCK_BRIDGE_DATA_EN_FR = {
  // RENAMED/RESHAPED: replaces the old top-level
  // userId / foundationCourseId / orderIndex / status fields.
  // - foundationCourseId -> courseId
  // - orderIndex -> bridgeIndex
  // - "status" is gone entirely
  // - nativeLanguage / targetLanguage / firstName / gender are brand new —
  //   this is the first time the payload carries personalization data
  //   directly instead of it being implicit in the copy.
  meta: {
    userId: "usr_test",
    courseId: "course_test",
    bridgeIndex: 1,
    nativeLanguage: "en-US",
    targetLanguage: "fr-FR",
    firstName: "Paul",
    gender: "male",
  },

  // REPLACES: visualContent. Keeps imageS3Key/npcAudioS3Key/npcLine, but:
  // - sceneDescription is GONE (no more prose scene description)
  // - constraint / validReplies is GONE — there's no "reply to the NPC"
  //   freestyle-style constraint baked into the scene anymore
  // - altText is now a generic templated string ("Scene about X"), not a
  //   literal visual description — don't rely on it for real alt text
  // - videoS3Key is NEW — the scene now has an animated video, not just a
  //   still image
  bridgeScene: {
    imageS3Key: "foundation/usr_test/day1/visual.png",
    npcAudioS3Key:
      "vocab/en-US_fr-FR/nodes/A1_greetings_and_names/61636a56fd/npc.mp3",
    npcLine:
      "Bonjour ! Vous êtes le nouveau voisin, n'est-ce pas ? Moi, c'est Marie, j'habite juste à côté. Ravi de vous rencontrer !",
    altText: "Scene about Greetings and Names",
    videoS3Key:
      "vocab/en-US_fr-FR/nodes/A1_greetings_and_names/61636a56fd/scene_animated.mp4",
  },

  // BRAND NEW SECTION — didn't exist in the old mock at all. A flat list of
  // standalone vocab words (separate from the target sentence), each with
  // its own audio and a "labelHint" (currently identical to "word" — looks
  // like it's meant for a UI label but the backend isn't varying it yet).
  vocabMoment: [
    {
      word: "la voisine",
      gloss: "the neighbor",
      audioS3Key:
        "vocab/en-US_fr-FR/nodes/A1_greetings_and_names/61636a56fd/vocab_0.mp3",
      labelHint: "la voisine",
    },
    {
      word: "la poignée de main",
      gloss: "the handshake",
      audioS3Key:
        "vocab/en-US_fr-FR/nodes/A1_greetings_and_names/61636a56fd/vocab_1.mp3",
      labelHint: "la poignée de main",
    },
    {
      word: "le couloir",
      gloss: "the hallway",
      audioS3Key:
        "vocab/en-US_fr-FR/nodes/A1_greetings_and_names/61636a56fd/vocab_2.mp3",
      labelHint: "le couloir",
    },
  ],

  // REPLACES: quizContent (which had 4 fixed item "type"s and a
  // passThreshold). "cooldown" is a much richer, heterogeneous list — think
  // of it as a discriminated union keyed on "mechanic", where each mechanic
  // has its own required fields. There's no passThreshold here at all.
  //
  // ⚠️ GOTCHA: "correct" is NOT a consistent type across mechanics —
  // word_coupling below uses an array (["Bonjour"]), but context_clash uses
  // a bare string ("Bonjour, enchanté !"). Normalize this before rendering
  // or your correctness-check logic will break on one of the two.
  //
  // ⚠️ Every item's "itemId" is currently an empty string "" — don't use it
  // as a React key or dedupe key as-is; fall back to array index or mint
  // your own id until the backend actually populates this.
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
        "You are Paul. In the hallway of your apartment building, you see your new neighbor for the very first time.",
      instructionNative: "What do you say to her first?",
      targetWord: "la voisine",
      options: ["Bonjour", "le couloir", "la poignée de main"],
      correct: ["Bonjour"],
      feedback: {
        "le couloir":
          "That's the place where you are standing, not something you say to her.",
        "la poignée de main":
          "That's something you do with your hand, not a word you say.",
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
      baseSentence: "Bonjour, je suis Paul, enchanté !",
      contextNative:
        "That evening, you run into the same neighbor in the hallway again. She has clearly forgotten your name, so you introduce yourself one more time.",
      instructionNative: "What do you say now?",
      expected: ["Bonsoir, je suis Paul, enchanté !"],
      expectedFolds: ["bonsoir, je suis paul, enchante"],
      rejectFeedback: {
        "Bonjour, je suis Paul, enchanté !":
          "It is evening now, so start with the evening greeting instead of the daytime one.",
        "Bonsoir, je suis Paul, enchantée !":
          "Paul is a man, so keep 'enchanté' exactly as you learned it — 'enchantée' is what a woman would say.",
        "Salut, je suis Paul, enchanté !":
          "'Salut' is very casual — with a neighbor you don't know well, use the standard evening greeting.",
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
        "It's your first morning in the building, and you run into your new neighbor, Madame Lambert, in the hallway. She smiles and holds out her hand.",
      instructionNative: "What should you say as you shake her hand?",
      options: ["Bonjour, enchanté !", "Bonsoir, madame.", "Salut !"],
      // NOTE: string here, not an array — see the ⚠️ gotcha above.
      correct: "Bonjour, enchanté !",
      feedback: {
        "Salut !":
          "« Salut » is for friends and people you already know well. With a neighbor you've just met, it sounds overly familiar — open with « Bonjour » instead.",
        "Bonsoir, madame.":
          "« Bonsoir » is the evening greeting, and it's morning here, so a French speaker would find it confusing. Say « Bonjour », and add « enchanté » when meeting someone for the first time.",
      },
    },
    {
      mechanic: "video_spotlight",
      pillar: "lexical",
      provenance: {
        nodeId: "A1_greetings_and_names",
        sourceChunkIds: ["Bonjour", "je suis", "enchanté"],
        pillar: "lexical",
        mechanic: "video_spotlight",
      },
      itemId: "",
      videoS3Key:
        "vocab/en-US_fr-FR/nodes/A1_greetings_and_names/61636a56fd/scene_animated.mp4",
      targetAudioS3Key:
        "vocab/en-US_fr-FR/nodes/A1_greetings_and_names/61636a56fd/vocab_0.mp3",
      targetWord: "la voisine",
      contextNative:
        "You have just moved into a new apartment building. Watch the scene carefully.",
      instructionNative: "Who introduces herself to you in the hallway?",
      options: ["la poignée de main", "la voisine", "le couloir"],
      // NOTE: unlike the other 3 mechanics, this one has no "correct" or
      // "feedback" field at all — presumably targetWord IS the answer.
    },
  ],

  // REPLACES: pronunciationData. Much slimmer now — the old per-chunk
  // "breakdown" array (text/phonetic/hint for each word group) is GONE.
  // "engine" is new (names the ASR/pronunciation-scoring provider). Only
  // referenceText + focusSounds survive from before.
  pronunciationCheck: {
    referenceText: "Bonjour, je suis Paul, enchanté !",
    engine: "azure",
    focusSounds: [
      {
        sound: "nasal on (ɔ̃)",
        positions: [0],
      },
    ],
  },

  // REPLACES: lessonHandoff. Dramatically slimmer — all the intro/outro
  // copy+audio, day/theme, chunks list, taughtChunks/blankedWords/
  // wrongAnswers rollups, sceneDescription duplicate, etc. are ALL GONE.
  // What's left/new:
  // - primedChunks / lingeringWeaknesses: empty arrays here, presumably
  //   populated on later bridges from prior-lesson performance
  // - bridgeAssets: a small bundle of just the media keys needed to render
  //   this bridge again (image/npcAudio/vocabMomentAudio[]/video)
  // - unlockNext: boolean gate, new concept — didn't exist before
  // - bridgeLexicon: just the bare vocab words (no gloss/audio), a slimmed
  //   echo of vocabMoment
  // - usedShiftIds: empty array here — likely tracks which variable_shift
  //   cooldown items have already been served, for spaced repetition
  handoffFragment: {
    primedChunks: [],
    lingeringWeaknesses: [],
    bridgeAssets: {
      imageS3Key: "foundation/usr_test/day1/visual.png",
      npcAudioS3Key:
        "vocab/en-US_fr-FR/nodes/A1_greetings_and_names/61636a56fd/npc.mp3",
      vocabMomentAudio: [
        "vocab/en-US_fr-FR/nodes/A1_greetings_and_names/61636a56fd/vocab_0.mp3",
        "vocab/en-US_fr-FR/nodes/A1_greetings_and_names/61636a56fd/vocab_1.mp3",
        "vocab/en-US_fr-FR/nodes/A1_greetings_and_names/61636a56fd/vocab_2.mp3",
      ],
      videoS3Key:
        "vocab/en-US_fr-FR/nodes/A1_greetings_and_names/61636a56fd/scene_animated.mp4",
    },
    unlockNext: true,
    bridgeLexicon: ["la voisine", "la poignée de main", "le couloir"],
    usedShiftIds: [],
  },
};

export const MOCK_BRIDGE_DATA_EN_ES = {
  meta: {
    userId: "usr_test",
    courseId: "course_test",
    bridgeIndex: 1,
    nativeLanguage: "en-US",
    targetLanguage: "es-ES",
    firstName: "Annalia",
    gender: "female",
  },

  bridgeScene: {
    imageS3Key: "foundation/usr_test/day1/visual.png",
    npcAudioS3Key:
      "vocab/en-US_es-ES/nodes/A1_greetings_and_names/2fc9f79bf2/npc.mp3",
    npcLine:
      "¡Hola! Bienvenida al edificio. Soy Carmen, tu vecina del 4A. ¿Cómo te llamas?",
    altText: "Scene about Greetings and Names",
    videoS3Key:
      "vocab/en-US_es-ES/nodes/A1_greetings_and_names/2fc9f79bf2/scene_animated.mp4",
  },

  vocabMoment: [
    {
      word: "la vecina",
      gloss: "the neighbor",
      audioS3Key:
        "vocab/en-US_es-ES/nodes/A1_greetings_and_names/2fc9f79bf2/vocab_0.mp3",
      labelHint: "la vecina",
    },
    {
      word: "el pasillo",
      gloss: "the hallway",
      audioS3Key:
        "vocab/en-US_es-ES/nodes/A1_greetings_and_names/2fc9f79bf2/vocab_1.mp3",
      labelHint: "el pasillo",
    },
    {
      word: "la planta",
      gloss: "the plant",
      audioS3Key:
        "vocab/en-US_es-ES/nodes/A1_greetings_and_names/2fc9f79bf2/vocab_2.mp3",
      labelHint: "la planta",
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
        "It's your first afternoon in the new building. In the hallway, you see a woman watering a plant — she's your new neighbor.",
      instructionNative: "What do you say to her first?",
      targetWord: "la vecina",
      options: ["Buenas", "la planta", "el pasillo"],
      correct: ["Buenas"],
      feedback: {
        "la planta":
          "'La planta' is the plant she's watering — it's a thing in the hallway, not something you say to her.",
        "el pasillo":
          "'El pasillo' is the hallway — that's where you're standing, not a greeting.",
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
      baseSentence: "Buenas tardes, encantada de conocerte. Soy Annalia.",
      contextNative:
        "That night, you run into your neighbor in the hallway again. This time she stops to talk, and you introduce yourself properly for the first time.",
      instructionNative: "What do you say now?",
      expected: ["Buenas, encantada de conocerte. Soy Annalia."],
      expectedFolds: ["buenas, encantada de conocerte. soy annalia"],
      rejectFeedback: {
        "Buenas tardes, encantada de conocerte. Soy Annalia.":
          "It's night now, so the afternoon greeting 'Buenas tardes' no longer fits — just say 'Buenas'.",
        "Buenas noches, encantada de conocerte. Soy Annalia.":
          "'Buenas noches' is mostly for saying goodbye at night — for a quick hello to a neighbor, 'Buenas' is the natural choice.",
        "Buenas, encantado de conocerte. Soy Annalia.":
          "'Encantado' is what a man says — Annalia is a woman, so she says 'encantada'.",
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
        "It's late afternoon and you've just moved into your new apartment. In the hallway, you run into a young woman carrying a potted plant — your new neighbor — and she greets you with a smile: 'Buenas tardes.'",
      instructionNative: "Which response is most appropriate here?",
      options: [
        "Buenas tardes, soy la nueva vecina. Encantada de conocerte.",
        "¡Hola, tía! ¿Qué pasa?",
        "Buenas noches, ¿qué tal?",
      ],
      // NOTE: string here, not an array
      correct: "Buenas tardes, soy la nueva vecina. Encantada de conocerte.",
      feedback: {
        "Buenas noches, ¿qué tal?":
          "It's the middle of the afternoon, so 'buenas noches' would make you sound like you've lost track of time — that greeting is for evening and night. Use 'buenas tardes' instead.",
        "¡Hola, tía! ¿Qué pasa?":
          "'¡Hola, tía!' is slang you'd use with close friends, and to a neighbor you're meeting for the first time it comes across as too familiar. A warm 'buenas tardes' with a proper introduction hits the right note.",
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
          "encantada",
          "de",
          "conocerte",
          "Soy",
        ],
        pillar: "lexical",
        mechanic: "video_spotlight",
      },
      itemId: "",
      videoS3Key:
        "vocab/en-US_es-ES/nodes/A1_greetings_and_names/2fc9f79bf2/scene_animated.mp4",
      targetAudioS3Key:
        "vocab/en-US_es-ES/nodes/A1_greetings_and_names/2fc9f79bf2/vocab_0.mp3",
      targetWord: "la vecina",
      contextNative: "Watch the scene carefully.",
      instructionNative: "Who is greeting you in the hallway?",
      options: ["la planta", "la vecina", "el pasillo"],
      // NOTE: no "correct" or "feedback" — targetWord is the answer.
    },
  ],

  pronunciationCheck: {
    referenceText: "Buenas tardes, encantada de conocerte. Soy Annalia.",
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
      imageS3Key: "foundation/usr_test/day1/visual.png",
      npcAudioS3Key:
        "vocab/en-US_es-ES/nodes/A1_greetings_and_names/2fc9f79bf2/npc.mp3",
      vocabMomentAudio: [
        "vocab/en-US_es-ES/nodes/A1_greetings_and_names/2fc9f79bf2/vocab_0.mp3",
        "vocab/en-US_es-ES/nodes/A1_greetings_and_names/2fc9f79bf2/vocab_1.mp3",
        "vocab/en-US_es-ES/nodes/A1_greetings_and_names/2fc9f79bf2/vocab_2.mp3",
      ],
      videoS3Key:
        "vocab/en-US_es-ES/nodes/A1_greetings_and_names/2fc9f79bf2/scene_animated.mp4",
    },
    unlockNext: true,
    bridgeLexicon: ["la vecina", "el pasillo", "la planta"],
    usedShiftIds: [],
  },
};