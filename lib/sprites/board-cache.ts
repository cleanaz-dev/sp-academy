// lib/sprites/board-cache.ts
import { redis } from "@/lib/upstash";
import { prisma } from "@/lib/prisma";
import {
  ChalkboardSchema,
  type ChalkboardData,
  type BoardFeedback,
} from "@/lib/schema/sprite-schema";

const getBoardKey = (sessionId: string) => `sprite:board:v1:${sessionId}`;
const BOARD_TTL_SECONDS = 60 * 60 * 6; // 6 hours in Redis

export async function getCachedBoard(
  sessionId?: string
): Promise<ChalkboardData | null> {
  if (!sessionId) return null;

  // 1. Fast path: Check Upstash Redis
  try {
    const raw = await redis.get<ChalkboardData>(getBoardKey(sessionId));
    if (raw) {
      const parsed = ChalkboardSchema.safeParse(raw);
      if (parsed.success) return parsed.data;
    }
  } catch (err) {
    console.warn("[getCachedBoard] Redis read error:", err);
  }

  // 2. Fallback: Check Postgres `SpriteSession.board` if Redis TTL expired
  try {
    const dbSession = await prisma.spriteSession.findUnique({
      where: { id: sessionId },
      select: { board: true },
    });
    if (dbSession?.board) {
      const parsed = ChalkboardSchema.safeParse(dbSession.board);
      if (parsed.success) {
        // Warm Redis cache back up
        await redis
          .set(getBoardKey(sessionId), parsed.data, { ex: BOARD_TTL_SECONDS })
          .catch(() => {});
        return parsed.data;
      }
    }
  } catch (err) {
    console.warn("[getCachedBoard] DB fallback error:", err);
  }

  return null;
}

export async function saveCachedBoard(
  sessionId: string,
  board: ChalkboardData
): Promise<ChalkboardData> {
  const normalized: ChalkboardData = {
    ...board,
    boardId: board.boardId || crypto.randomUUID(),
    status: board.status || "IN_PROGRESS",
    currentStepIndex: board.currentStepIndex ?? 0,
    steps: (board.steps || []).map((s, idx) => ({
      ...s,
      id: s.id || `step-${idx + 1}`,
      userAttempts: Array.isArray(s.userAttempts) ? s.userAttempts : [],
      struggled: Boolean(s.struggled),
      correctionGiven: s.correctionGiven ?? null,
      completedAt: s.completedAt ?? null,
    })),
  };

  try {
    await redis.set(getBoardKey(sessionId), normalized, {
      ex: BOARD_TTL_SECONDS,
    });
  } catch (err) {
    console.warn("[saveCachedBoard] Redis write error:", err);
  }

  return normalized;
}

/**
 * Records the learner's attempt on the active step and advances/updates the board
 */
export async function applyStepDecisionToBoard(
  sessionId: string,
  currentBoard: ChalkboardData,
  decision: "ADVANCE" | "STAY" | "COMPLETE",
  feedback?: BoardFeedback | null,
  userPrompt?: string
): Promise<ChalkboardData> {
  const totalSteps = currentBoard.steps.length;
  const activeIdx = currentBoard.currentStepIndex;

  const isManualSkip =
    !userPrompt ||
    /^next step/i.test(userPrompt.trim()) ||
    /^got it, next step/i.test(userPrompt.trim());

  const hadCorrection = Boolean(
    feedback &&
      (feedback.status === "retry" ||
        feedback.correctionFrom ||
        feedback.correctionTo)
  );

  // Update telemetry on the step the learner just interacted with
  const updatedSteps = currentBoard.steps.map((step, idx) => {
    if (idx !== activeIdx) return step;

    const prevAttempts = Array.isArray(step.userAttempts)
      ? step.userAttempts
      : [];
    const nextAttempts =
      !isManualSkip && userPrompt
        ? [...prevAttempts, userPrompt.trim()].slice(-5)
        : prevAttempts;

    const stepFinished = decision === "ADVANCE" || decision === "COMPLETE";

    return {
      ...step,
      userAttempts: nextAttempts,
      struggled: Boolean(
        step.struggled || hadCorrection || decision === "STAY"
      ),
      correctionGiven: hadCorrection
        ? feedback
        : (step.correctionGiven ?? null),
      completedAt: stepFinished
        ? new Date().toISOString()
        : (step.completedAt ?? null),
    };
  });

  let nextIndex = activeIdx;
  let nextStatus = currentBoard.status;

  if (decision === "COMPLETE") {
    nextStatus = "COMPLETED";
    nextIndex = Math.max(0, totalSteps - 1);
  } else if (decision === "ADVANCE") {
    if (activeIdx + 1 >= totalSteps) {
      nextStatus = "COMPLETED";
      nextIndex = Math.max(0, totalSteps - 1);
    } else {
      nextIndex = activeIdx + 1;
    }
  }

  const updated: ChalkboardData = {
    ...currentBoard,
    status: nextStatus,
    currentStepIndex: nextIndex,
    steps: updatedSteps,
    lastFeedback: feedback ?? null,
  };

  return saveCachedBoard(sessionId, updated);
}