// lib/boss/build-boss-payload.ts
type Json = Record<string, any>;

type WordMatrixEntry = Awaited<
  ReturnType<typeof import("./get-word-matrix").getWordMatrix>
>[number];

function pick(obj: Json | null | undefined, keys: string[]) {
  const out: Json = {};
  for (const k of keys) {
    if (obj && obj[k] !== undefined) out[k] = obj[k];
  }
  return out;
}

export function buildBossPayload(args: {
  taskId: string;
  bossStageId: string;
  targetLanguage: string;
  nativeLanguage: string;
  milestoneIndex: number;
  lessons: any[];
  bridges: any[];
  wordMatrix: WordMatrixEntry[];
  webhookUrl: string;
}) {
  const { lessons, bridges, ...rest } = args; // wordMatrix stays in rest

  const slimLessons = lessons.map((lesson) => {
    const bridge = bridges.find((b) => b.foundationLessonId === lesson.id);

    return {
      id: lesson.id,
      title: lesson.title,
      orderIndex: lesson.orderIndex,

      lessonHandoff: pick(lesson.lessonHandoff, [
        "theme",
        "taughtChunks",
        "targetSentence",
        "npcLine",
        "sceneDescription",
        "wrongAnswers",
        "freestyleTopic",
        "freestylePersona",
      ]),

      grammarContent: pick(lesson.grammarContent, [
        "targetSentence",
        "nativeSentence",
      ]),

      freestyle: pick(lesson.freestyle, [
        "topic",
        "persona",
        "level",
        "requiredChunks",
      ]),

      // Vocab from the matching bridge (words and glosses only)
      vocab: (bridge?.vocabMoment ?? []).map((v: Json) => ({
        word: v.word,
        gloss: v.gloss,
      })),
      lingeringWeaknesses: bridge?.handoffFragment?.lingeringWeaknesses ?? [],
    };
  });

  return { ...rest, lessons: slimLessons };
}