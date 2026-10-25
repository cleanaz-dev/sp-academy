// app/actions/complete-vocab-bridge.ts
"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { triggerMilestoneBossAndNextSpoon } from "@/lib/foundation/trigger-milestone-boss";

function normalizeSlug(word: string): string {
  return word
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "_");
}

function inferNounMeta(cleanWord: string) {
  if (cleanWord.startsWith("le ") || cleanWord.startsWith("un ")) {
    return {
      gender: "M",
      lemma: cleanWord.replace(/^(le|un)\s+/, ""),
      pos: "NOUN",
    };
  }
  if (cleanWord.startsWith("la ") || cleanWord.startsWith("une ")) {
    return {
      gender: "F",
      lemma: cleanWord.replace(/^(la|une)\s+/, ""),
      pos: "NOUN",
    };
  }
  return {
    gender: null,
    lemma: cleanWord,
    pos: cleanWord.includes(" ") ? "EXPRESSION" : "NOUN",
  };
}

export async function completeVocabBridge(bridgeId: string) {
  try {
    const user = await requireUser();

    if (!bridgeId || typeof bridgeId !== "string") {
      throw new Error("Invalid bridgeId");
    }

    // 1. Fetch the bridge details INCLUDING vocabMoment
    const bridge = await prisma.foundationBridge.findUnique({
      where: { id: bridgeId, userId: user.id },
      select: {
        id: true,
        bridgeIndex: true,
        foundationCourseId: true,
        vocabMoment: true,
      },
    });

    if (!bridge) throw new Error("Bridge not found");

    // 2. Mark the bridge as passed
    await prisma.foundationBridge.update({
      where: { id: bridgeId },
      data: {
        passed: true,
        completedAt: new Date(),
        attempts: { increment: 1 },
        score: 1.0,
      },
    });

    // 3. Upsert all vocabMoment words (with their gloss -> translation, gender, lemma) into WordStat!
    const vocabItems = Array.isArray(bridge.vocabMoment)
      ? (bridge.vocabMoment as Array<{
          word?: string;
          gloss?: string;
          audioS3Key?: string;
        }>)
      : [];

    if (vocabItems.length > 0) {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { targetLanguage: true },
      });

      const targetLang =
        dbUser?.targetLanguage || (user as any).targetLanguage || "fr-FR";

      const profile = await prisma.languageProfile.upsert({
        where: {
          userId_languageCode: {
            userId: user.id,
            languageCode: targetLang,
          },
        },
        update: {},
        create: {
          userId: user.id,
          languageCode: targetLang,
        },
      });

      for (const item of vocabItems) {
        if (!item?.word) continue;
        const cleanWord = item.word
          .trim()
          .toLowerCase()
          .replace(/[.,!?;:"]+$/g, "")
          .trim();
        if (!cleanWord) continue;

        const slug = normalizeSlug(cleanWord);
        const inferred = inferNounMeta(cleanWord);
        const wordType =
          cleanWord.includes(" ") || cleanWord.includes("'")
            ? "PHRASE"
            : "WORD";
        const componentWords =
          wordType === "PHRASE"
            ? cleanWord.split(/[\s']+/).filter(Boolean)
            : [];

        await prisma.wordStat.upsert({
          where: {
            languageProfileId_word: {
              languageProfileId: profile.id,
              word: cleanWord,
            },
          },
          update: {
            ...(item.gloss ? { translation: item.gloss } : {}),
            partOfSpeech: inferred.pos,
            lemma: inferred.lemma,
            ...(inferred.gender ? { grammaticalGender: inferred.gender } : {}),
          },
          create: {
            languageProfileId: profile.id,
            word: cleanWord,
            wordType,
            partOfSpeech: inferred.pos,
            translation: item.gloss || null,
            lemma: inferred.lemma,
            grammaticalGender: inferred.gender,
            componentWords,
            audioMaleKey: `foundation/words/${targetLang}/m/${slug}.mp3`,
            audioFemaleKey:
              item.audioS3Key || `foundation/words/${targetLang}/f/${slug}.mp3`,
            seenCount: 1,
            heardCount: 1,
            masteryScore: 1,
            status: "NEW",
          },
        });
      }
    }

    // 4. Ensure Boss Stage + Boss Sprite + Next Spoon are baking/ready
    if (bridge.bridgeIndex % 3 === 0) {
      await triggerMilestoneBossAndNextSpoon({
        userId: user.id,
        courseId: bridge.foundationCourseId,
        milestoneIndex: bridge.bridgeIndex / 3,
        prebakeNextSpoon: true,
      });
    }

    return { ok: true };
  } catch (error) {
    console.error("❌ Failed to complete vocab bridge:", error);
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Failed to complete bridge",
    };
  }
}