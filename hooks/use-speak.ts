"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export function useSpeak() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onPlay = () => setIsPlaying(true);
    const onEnded = () => setIsPlaying(false);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("play", onPlay);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("pause", onPause);
      audio.pause();
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const speak = useCallback(
    async (
      text: string,
      targetLanguage: string,
      speed: number = 1.0,
      gender?: "male" | "female",
    ) => {
      try {
        setIsLoading(true);
        abortRef.current?.abort();
        abortRef.current = new AbortController();

        // Cleanup previous playback
        if (audioRef.current) {
          audioRef.current.pause();
          if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
          }
        }

        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            language: targetLanguage,
            speed,
            gender,
          }),
          signal: abortRef.current.signal,
        });

        if (!response.ok) throw new Error("Failed to generate speech");
        if (!response.body) throw new Error("No stream body");

        const mimeType = "audio/mpeg";

        // Check if browser supports MSE for MP3 streaming
        const canStreamMse =
          typeof MediaSource !== "undefined" &&
          MediaSource.isTypeSupported(mimeType);

        if (canStreamMse && audioRef.current) {
          // ========== STREAMING PATH (Chrome/Edge/Firefox) ==========
          const mediaSource = new MediaSource();
          const streamUrl = URL.createObjectURL(mediaSource);
          objectUrlRef.current = streamUrl;
          audioRef.current.src = streamUrl;

          // Wait for MediaSource to open
          await new Promise<void>((resolve) => {
            mediaSource.addEventListener("sourceopen", () => resolve(), {
              once: true,
            });
          });

          const sourceBuffer = mediaSource.addSourceBuffer(mimeType);
          const reader = response.body.getReader();
          const queue: Uint8Array[] = [];
          let streamDone = false;

          // Drain the queue whenever the sourceBuffer is ready
          const drainQueue = () => {
            if (sourceBuffer.updating) return;

            if (queue.length > 0) {
              const chunk = queue.shift()!;
              try {
                // 💡 Fix: cast the stream chunk to BufferSource
                sourceBuffer.appendBuffer(chunk as BufferSource);
              } catch (err) {
                console.error("MSE append error:", err);
                streamDone = true;
                reader.cancel().catch(() => {});
                try {
                  mediaSource.endOfStream();
                } catch {}
              }
              return;
            }

            if (streamDone && mediaSource.readyState === "open") {
              try {
                mediaSource.endOfStream();
              } catch {}
            }
          };

          sourceBuffer.addEventListener("updateend", drainQueue);

          // Start playback as soon as the pipeline is ready — audio will
          // begin when the first chunk is appended
          setIsLoading(false);
          audioRef.current.play().catch(() => {});

          // Read chunks from the network as fast as they arrive
          while (!streamDone) {
            const { done, value } = await reader.read();
            if (done) {
              streamDone = true;
              drainQueue();
              break;
            }
            queue.push(value);
            drainQueue();
          }
        } else {
          // ========== SAFARI FALLBACK: buffer blob ==========
          const audioBlob = await response.blob();
          const blobUrl = URL.createObjectURL(audioBlob);
          objectUrlRef.current = blobUrl;

          if (audioRef.current) {
            audioRef.current.src = blobUrl;
            setIsLoading(false);
            await audioRef.current.play();
          }
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("TTS Error:", error);
        }
        setIsLoading(false);
        setIsPlaying(false);
      }
    },
    [],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  return { speak, stop, isPlaying, isLoading };
}
