export const MOCK_FOUNDATION_DATA = {
  userId: "usr_test",
  foundationCourseId: "course_test",
  orderIndex: 1,
  status: "ready",
  visualContent: {
    imageS3Key: "foundation/usr_test/day1/visual.png",
    sceneDescription:
      "In the tidy hallway of your new apartment building, a friendly neighbor introduces herself and offers her hand in greeting.",
    altText:
      "A tidy apartment hallway with pale walls, a row of potted plants along the floor, and a smiling neighbor woman standing by her open door, extending her hand in greeting toward the viewer.",
    npcLine:
      "Bonjour ! Je suis Marie, votre voisine du troisième. *Elle vous tend la main avec un sourire.*",
    constraint: {
      requiredChunk: "enchanté",
      validReplies: [
        "Bonjour, enchanté. Je suis Alex.",
        "Enchanté, Marie. Moi, je suis Alex.",
        "Enchanté ! Je suis Alex, votre nouveau voisin.",
      ],
    },
  },
  grammarContent: {
    targetSentence: "Bonjour, enchanté. Je suis Alex.",
    nativeSentence: "Hello, nice to meet you. I'm Alex.",
    romanizedSentence: null,
    words: [
      {
        word: "Bonjour",
        gloss: "hello / good day",
        role: "greeting (interjection)",
      },
      {
        word: "enchanté",
        gloss: "nice to meet you",
        role: "fixed polite phrase",
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
        word: "Alex",
        gloss: "Alex",
        role: "name (predicate noun)",
      },
    ],
    highlightGroup: ["Bonjour", "enchanté", "Je", "suis"],
    clozeItems: [
      {
        id: "cloze-1",
        hostSentence: "___, enchanté. Je suis Alex.",
        blankPosition: 0,
        acceptableAnswers: ["Bonjour", "bonjour"],
        wrongAnswerFeedback: [
          {
            wrong: "Salut",
            feedback:
              "«Salut» is too casual for a formal neighbor — use «Bonjour».",
          },
          {
            wrong: "Bonsoir",
            feedback:
              "«Bonsoir» is for the evening; during the day say «Bonjour».",
          },
        ],
      },
      {
        id: "cloze-2",
        hostSentence: "Bonjour, ___. Je suis Alex.",
        blankPosition: 1,
        acceptableAnswers: ["enchanté", "Enchanté", "enchantée", "Enchantée"],
        wrongAnswerFeedback: [
          {
            wrong: "enchanter",
            feedback: "Drop the final -r: the fixed phrase is «enchanté».",
          },
          {
            wrong: "merci",
            feedback:
              "«Merci» means 'thank you'; say «enchanté» for 'nice to meet you'.",
          },
        ],
      },
      {
        id: "cloze-3",
        hostSentence: "Bonjour, enchanté. Je ___ Alex.",
        blankPosition: 3,
        acceptableAnswers: ["suis"],
        wrongAnswerFeedback: [
          {
            wrong: "est",
            feedback: "«Est» goes with he/she; with «je» always use «suis».",
          },
          {
            wrong: "sont",
            feedback: "«Sont» is for 'they'; with «je» say «suis».",
          },
        ],
      },
    ],
  },
  pronunciationData: {
    referenceText: "Bonjour, enchanté. Je suis Alex.",
    audioS3Key: "foundation/usr_test/day1/pronunciation.mp3",
    focusSounds: [
      {
        sound: "nasal on (ɔ̃)",
        positions: [0],
      },
    ],
  },
  listeningContent: {
    id: "listen-1",
    referenceText: "Bonjour, enchanté. Je suis Alex.",
    audioS3Key: "foundation/usr_test/day1/listening.mp3",
    options: [
      "Bonjour, enchanté. Je suis Alex.",
      "Bonjour, enchanté. Je suis Alexa.",
      "Bonsoir, enchanté. Je suis Alex.",
      "Salut, enchanté. Je suis Alex.",
    ],
    correctIndex: 0,
    contrast: "bonjour vs bonsoir (daytime vs evening greeting)",
  },
  quizContent: {
    items: [
      {
        type: "cloze",
        cloze: {
          id: "cloze-1",
          hostSentence: "___, enchanté. Je suis Alex.",
          blankPosition: 0,
          acceptableAnswers: ["Bonjour", "bonjour"],
          wrongAnswerFeedback: [
            {
              wrong: "Salut",
              feedback:
                "«Salut» is too casual for a formal neighbor — use «Bonjour».",
            },
            {
              wrong: "Bonsoir",
              feedback:
                "«Bonsoir» is for the evening; during the day say «Bonjour».",
            },
          ],
        },
      },
      {
        type: "cloze",
        cloze: {
          id: "cloze-2",
          hostSentence: "Bonjour, ___. Je suis Alex.",
          blankPosition: 1,
          acceptableAnswers: ["enchanté", "Enchanté", "enchantée", "Enchantée"],
          wrongAnswerFeedback: [
            {
              wrong: "enchanter",
              feedback: "Drop the final -r: the fixed phrase is «enchanté».",
            },
            {
              wrong: "merci",
              feedback:
                "«Merci» means 'thank you'; say «enchanté» for 'nice to meet you'.",
            },
          ],
        },
      },
      {
        type: "cloze",
        cloze: {
          id: "cloze-3",
          hostSentence: "Bonjour, enchanté. Je ___ Alex.",
          blankPosition: 3,
          acceptableAnswers: ["suis"],
          wrongAnswerFeedback: [
            {
              wrong: "est",
              feedback: "«Est» goes with he/she; with «je» always use «suis».",
            },
            {
              wrong: "sont",
              feedback: "«Sont» is for 'they'; with «je» say «suis».",
            },
          ],
        },
      },
      {
        type: "listening",
        listening: {
          id: "listen-1",
          referenceText: "Bonjour, enchanté. Je suis Alex.",
          audioS3Key: "foundation/usr_test/day1/listening.mp3",
          options: [
            "Bonjour, enchanté. Je suis Alex.",
            "Bonjour, enchanté. Je suis Alexa.",
            "Bonsoir, enchanté. Je suis Alex.",
            "Salut, enchanté. Je suis Alex.",
          ],
          correctIndex: 0,
          contrast: "bonjour vs bonsoir (daytime vs evening greeting)",
        },
      },
    ],
    passThreshold: 0.7,
  },
  freestyle: {
    mode: "SPECIFIC",
    level: "ZERO",
    topic: "Greeting a Neighbor",
    persona: "a neighbor you run into in your apartment building",
    requiredChunks: ["Bonjour", "Bonsoir", "Enchanté(e)", "Je suis [nom]"],
    openingLine:
      "You run into a neighbor in your apartment building — greet them with the right greeting for the time of day, politely tell them your name, and say 'nice to meet you', replying in French.",
  },
  lessonHandoff: {
    day: 1,
    theme: "Greetings and Names",
    targetSentence: "Bonjour, enchanté. Je suis Alex.",
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
      "Bonjour ! Je suis Marie, votre voisine du troisième. *Elle vous tend la main avec un sourire.*",
    freestyleTopic: "Greeting a Neighbor",
  },
};
