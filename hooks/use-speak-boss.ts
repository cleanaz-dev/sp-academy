"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Gender = "male" | "female";

type PendingPlayback = {
  resolve: () => void;
  reject: (error: Error) => void;
};

export function useSpeakBoss() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const readerRef =
    useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const pendingRef = useRef<PendingPlayback | null>(null);

  // Prevent stale async work from an older speak() call from affecting
  // the current call.
  const operationIdRef = useRef(0);
  const mountedRef = useRef(true);

  const safeSetIsPlaying = useCallback((value: boolean) => {
    if (mountedRef.current) {
      setIsPlaying(value);
    }
  }, []);

  const safeSetIsLoading = useCallback((value: boolean) => {
    if (mountedRef.current) {
      setIsLoading(value);
    }
  }, []);

  const revokeObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const settlePending = useCallback(
    (result: "resolve" | "reject", error?: Error) => {
      const pending = pendingRef.current;

      if (!pending) return;

      pendingRef.current = null;

      if (result === "resolve") {
        pending.resolve();
      } else {
        pending.reject(error ?? new Error("Playback failed"));
      }
    },
    [],
  );

  const stopCurrent = useCallback(
    (settle: boolean) => {
      operationIdRef.current += 1;

      abortRef.current?.abort();
      abortRef.current = null;

      readerRef.current?.cancel().catch(() => {});
      readerRef.current = null;

      const audio = audioRef.current;

      if (audio) {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      }

      revokeObjectUrl();
      safeSetIsLoading(false);
      safeSetIsPlaying(false);

      // A user-initiated stop is treated as successful completion.
      if (settle) {
        settlePending("resolve");
      }
    },
    [
      revokeObjectUrl,
      safeSetIsLoading,
      safeSetIsPlaying,
      settlePending,
    ],
  );

  useEffect(() => {
    mountedRef.current = true;

    const audio = new Audio();
    audioRef.current = audio;

    const onPlay = () => {
      safeSetIsLoading(false);
      safeSetIsPlaying(true);
    };

    const onPause = () => {
      safeSetIsPlaying(false);
    };

    const onEnded = () => {
      safeSetIsLoading(false);
      safeSetIsPlaying(false);
      settlePending("resolve");
    };

    const onError = () => {
      safeSetIsLoading(false);
      safeSetIsPlaying(false);
      settlePending("reject", new Error("Playback failed"));
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      mountedRef.current = false;
      operationIdRef.current += 1;

      abortRef.current?.abort();
      readerRef.current?.cancel().catch(() => {});

      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);

      audio.pause();
      audio.removeAttribute("src");
      audio.load();

      revokeObjectUrl();

      // Do not leave callers awaiting forever during unmount.
      settlePending("resolve");

      audioRef.current = null;
      abortRef.current = null;
      readerRef.current = null;
    };
  }, [
    revokeObjectUrl,
    safeSetIsLoading,
    safeSetIsPlaying,
    settlePending,
  ]);

  const speak = useCallback(
    (
      text: string,
      targetLanguage: string,
      speed = 0.9,
      gender?: Gender,
    ): Promise<void> => {
      // Starting new speech stops and settles the previous speech.
      stopCurrent(true);

      const operationId = operationIdRef.current;
      const controller = new AbortController();
      abortRef.current = controller;

      safeSetIsLoading(true);
      safeSetIsPlaying(false);

      return new Promise<void>((resolve, reject) => {
        pendingRef.current = { resolve, reject };

        const isCurrent = () =>
          operationId === operationIdRef.current &&
          !controller.signal.aborted;

        const fail = (error: unknown) => {
          if (!isCurrent()) return;

          const normalizedError =
            error instanceof Error ? error : new Error(String(error));

          safeSetIsLoading(false);
          safeSetIsPlaying(false);
          settlePending("reject", normalizedError);
        };

        void (async () => {
          try {
            const response = await fetch("/api/tts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                text,
                language: targetLanguage,
                speed,
                gender,
              }),
              signal: controller.signal,
            });

            if (!isCurrent()) return;

            if (!response.ok) {
              throw new Error("Failed to generate speech");
            }

            if (!response.body) {
              throw new Error("No stream body");
            }

            const audio = audioRef.current;

            if (!audio) {
              throw new Error("Audio element is unavailable");
            }

            const mimeType = "audio/mpeg";
            const canStreamMse =
              typeof MediaSource !== "undefined" &&
              MediaSource.isTypeSupported(mimeType);

            if (canStreamMse) {
              const mediaSource = new MediaSource();
              const streamUrl = URL.createObjectURL(mediaSource);

              objectUrlRef.current = streamUrl;
              audio.src = streamUrl;

              await new Promise<void>((resolveOpen, rejectOpen) => {
                const onOpen = () => {
                  cleanup();
                  resolveOpen();
                };

                const onAbort = () => {
                  cleanup();
                  rejectOpen(
                    new DOMException("The operation was aborted", "AbortError"),
                  );
                };

                const cleanup = () => {
                  mediaSource.removeEventListener("sourceopen", onOpen);
                  controller.signal.removeEventListener("abort", onAbort);
                };

                mediaSource.addEventListener("sourceopen", onOpen, {
                  once: true,
                });
                controller.signal.addEventListener("abort", onAbort, {
                  once: true,
                });
              });

              if (!isCurrent()) return;

              const sourceBuffer = mediaSource.addSourceBuffer(mimeType);
              const reader = response.body.getReader();
              readerRef.current = reader;

              const queue: Uint8Array[] = [];
              let streamDone = false;
              let streamFailed: Error | null = null;

              const endStream = () => {
                if (
                  streamDone &&
                  queue.length === 0 &&
                  !sourceBuffer.updating &&
                  mediaSource.readyState === "open"
                ) {
                  try {
                    mediaSource.endOfStream(
                      streamFailed ? "network" : undefined,
                    );
                  } catch {
                    // The MediaSource may already have been closed by stop().
                  }
                }
              };

              const drainQueue = () => {
                if (!isCurrent() || sourceBuffer.updating) return;

                const chunk = queue.shift();

                if (chunk) {
                  try {
                    sourceBuffer.appendBuffer(chunk as BufferSource);
                  } catch (error) {
                    streamFailed =
                      error instanceof Error
                        ? error
                        : new Error("MSE append failed");
                    streamDone = true;
                    void reader.cancel();
                    endStream();
                    fail(streamFailed);
                  }

                  return;
                }

                endStream();
              };

              sourceBuffer.addEventListener("updateend", drainQueue);

              // play() can reject because of autoplay policy or decoding errors.
              await audio.play();

              if (!isCurrent()) {
                sourceBuffer.removeEventListener("updateend", drainQueue);
                return;
              }

              safeSetIsLoading(false);

              try {
                while (isCurrent() && !streamDone) {
                  const { done, value } = await reader.read();

                  if (!isCurrent()) break;

                  if (done) {
                    streamDone = true;
                    drainQueue();
                    break;
                  }

                  queue.push(value);
                  drainQueue();
                }
              } catch (error) {
                if (isCurrent()) {
                  streamFailed =
                    error instanceof Error
                      ? error
                      : new Error("TTS stream failed");
                  streamDone = true;
                  endStream();
                  throw streamFailed;
                }
              } finally {
                sourceBuffer.removeEventListener("updateend", drainQueue);

                if (readerRef.current === reader) {
                  readerRef.current = null;
                }
              }
            } else {
              // Safari fallback: buffer the complete response.
              const audioBlob = await response.blob();

              if (!isCurrent()) return;

              const blobUrl = URL.createObjectURL(audioBlob);
              objectUrlRef.current = blobUrl;
              audio.src = blobUrl;

              await audio.play();

              if (isCurrent()) {
                safeSetIsLoading(false);
              }
            }

            // Intentionally do not resolve here. The promise is settled by:
            // - the audio "ended" event,
            // - the audio "error" event, or
            // - stop().
          } catch (error) {
            if (!isCurrent()) {
              // stop() or a newer speak() already settled this operation.
              return;
            }

            if (
              error instanceof DOMException &&
              error.name === "AbortError"
            ) {
              settlePending("resolve");
              return;
            }

            fail(error);
          }
        })();
      });
    },
    [
      safeSetIsLoading,
      safeSetIsPlaying,
      settlePending,
      stopCurrent,
    ],
  );

  const stop = useCallback(() => {
    stopCurrent(true);
  }, [stopCurrent]);

  return { speak, stop, isPlaying, isLoading };
}