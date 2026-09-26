// NOTE ON SCOPE: this payload is a different lesson type than the old
// MOCK_FOUNDATION_DATA. It's not a "foundation" lesson (grammar breakdown +
// pronunciation breakdown + listening reorder + fixed quiz + freestyle
// roleplay) — it's a "bridge" lesson (vocab intro + a mixed-mechanic drill
// set called "cooldown"). Several old sections don't exist here at all, and
// a couple of new ones show up. Named it MOCK_BRIDGE_DATA since that matches
// the payload's own vocabulary (bridgeScene, bridgeIndex, bridgeAssets,
// bridgeLexicon) — rename if you've got a different convention.

export const MOCK_BRIDGE_DATA = {
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