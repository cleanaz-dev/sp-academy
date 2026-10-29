// components/sprite/sprite-chat-history-tab.tsx
"use client";

import { useState } from "react";
import {
  MessageSquare,
  Trash2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { cleanDisplayString } from "./sprite-chat-utils";
import type { SpriteSessionData } from "@/lib/schema/sprite-schema";

interface SpriteChatHistoryTabProps {
  spriteName: string;
  sessionId: string;
  sessionsList: SpriteSessionData[];
  hasActiveTurns: boolean;
  onSelectSession: (session: SpriteSessionData) => void;
  onDeleteSession: (session: SpriteSessionData) => Promise<boolean>;
}

export function SpriteChatHistoryTab({
  spriteName,
  sessionId,
  sessionsList,
  hasActiveTurns,
  onSelectSession,
  onDeleteSession,
}: SpriteChatHistoryTabProps) {
  const [sessionToDelete, setSessionToDelete] =
    useState<SpriteSessionData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setSessionToDelete(null);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!sessionToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);

    const ok = await onDeleteSession(sessionToDelete);

    setIsDeleting(false);
    if (ok) {
      setSessionToDelete(null);
    } else {
      setDeleteError("Couldn't delete this session. Please try again.");
    }
  };

  const deleteTurnCount = Array.isArray(sessionToDelete?.turns)
    ? sessionToDelete.turns.length
    : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-2">
        <span className="text-xs font-black uppercase tracking-wider text-slate-400">
          Saved Sessions ({sessionsList.length})
        </span>
      </div>

      {sessionsList.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-10 text-center my-auto">
          <MessageSquare className="h-10 w-10 text-teal-400/60 mx-auto mb-3" />
          <p className="text-base font-bold text-white">
            No saved sessions yet
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Start a conversation in the Session tab to save your first session.
          </p>
        </div>
      ) : (
        sessionsList.map((sess) => {
          const isCurrentSession = sess.id === sessionId && hasActiveTurns;
          const turnCount = Array.isArray(sess.turns) ? sess.turns.length : 0;
          const lastTurn = turnCount > 0 ? sess.turns[turnCount - 1] : null;

          return (
            <div
              key={sess.id}
              className={`flex items-stretch rounded-2xl border transition ${
                isCurrentSession
                  ? "border-teal-500/60 bg-gradient-to-r from-teal-950/50 to-indigo-950/50"
                  : "border-white/10 bg-slate-900/70 hover:border-indigo-500/40 hover:bg-slate-900"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectSession(sess)}
                className="min-w-0 flex-1 text-left p-4"
              >
                <div className="flex items-center justify-between mb-1.5 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-extrabold text-white truncate max-w-[340px]">
                      {cleanDisplayString(sess.title)}
                    </span>
                    {isCurrentSession && (
                      <span className="rounded-md bg-teal-500/20 border border-teal-500/40 px-2 py-0.5 text-[9px] font-black uppercase text-teal-300 shrink-0">
                        Open
                      </span>
                    )}
                  </div>
                  <span className="rounded-lg bg-white/5 border border-white/10 px-2.5 py-0.5 text-[10px] font-bold text-slate-300 shrink-0">
                    {turnCount} {turnCount === 1 ? "turn" : "turns"}
                  </span>
                </div>

                {sess.lessonTitle && (
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-1">
                    Current: {sess.lessonTitle}
                  </span>
                )}

                {lastTurn && (
                  <p className="text-xs text-slate-300 line-clamp-1">
                    {spriteName}: {cleanDisplayString(lastTurn.assistantReply)}
                  </p>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setDeleteError(null);
                  setSessionToDelete(sess);
                }}
                title="Delete session"
                aria-label={`Delete session ${cleanDisplayString(sess.title)}`}
                className="flex w-12 shrink-0 items-center justify-center rounded-r-2xl border-l border-white/10 text-slate-500 transition hover:bg-rose-500/15 hover:text-rose-300"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        open={!!sessionToDelete}
        onClose={closeDeleteModal}
        labelledBy="delete-session-title"
        dismissible={!isDeleting}
      >
        {sessionToDelete && (
          <div className="rounded-3xl border border-rose-500/30 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl shadow-rose-950/40">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-rose-500/40 bg-rose-500/15">
                <AlertTriangle className="h-5 w-5 text-rose-300" />
              </div>
              <div className="min-w-0">
                <h3
                  id="delete-session-title"
                  className="text-lg font-extrabold text-white"
                >
                  Delete this session?
                </h3>
                <p className="mt-0.5 truncate text-xs font-bold text-slate-400">
                  {cleanDisplayString(sessionToDelete.title)}
                  {deleteTurnCount > 0 &&
                    ` · ${deleteTurnCount} ${
                      deleteTurnCount === 1 ? "turn" : "turns"
                    }`}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              Please review this session before deleting it. Once it&apos;s gone,{" "}
              <span className="font-bold text-white">{spriteName}</span>{" "}
              won&apos;t be able to recall this conversation, pick up where you
              left off, or build on it in future practice. This can&apos;t be
              undone.
            </p>

            {deleteError && (
              <p className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300">
                {deleteError}
              </p>
            )}

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/10 disabled:opacity-50"
              >
                Keep session
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500 px-4 py-2 text-xs font-extrabold text-white transition hover:bg-rose-400 disabled:opacity-70"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete session</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}