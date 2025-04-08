"use client";
import { Volume2 } from "lucide-react";
import { AudioLines } from "lucide-react";
import { useState, useRef, useEffect } from "react";

import React from "react";
import { Button } from "../ui/button";

export default function SpeakingModule({
  text,
  speaker,
  language,
  customColor = "blue-500",
  customCss,
  buttonSize,
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef(null);
  const mediaSourceRef = useRef(null);
  const sourceBufferRef = useRef(null);
  const readerRef = useRef(null);
  const isCancelled = useRef(false);

  const speakText = async (text, speaker) => {
    try {
      setIsSpeaking(true);
      isCancelled.current = false;

      const mediaSource = new MediaSource();
      mediaSourceRef.current = mediaSource;
      const audio = new Audio();
      audioRef.current = audio;
      audio.src = URL.createObjectURL(mediaSource);

      mediaSource.addEventListener(
        "sourceopen",
        async () => {
          if (isCancelled.current) return;

          const sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");
          sourceBufferRef.current = sourceBuffer;

          const response = await fetch("/api/speak", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, speaker, language }),
          });

          if (!response.ok) throw new Error("Failed to fetch audio stream");

          const reader = response.body.getReader();
          readerRef.current = reader;

          const pump = async () => {
            if (isCancelled.current) return;

            const { done, value } = await reader.read();

            if (done) {
              if (mediaSource.readyState === "open" && !sourceBuffer.updating) {
                mediaSource.endOfStream();
              } else if (sourceBuffer.updating) {
                sourceBuffer.addEventListener(
                  "updateend",
                  () => {
                    if (
                      mediaSource.readyState === "open" &&
                      !isCancelled.current
                    ) {
                      mediaSource.endOfStream();
                    }
                  },
                  { once: true },
                );
              }
              return;
            }

            if (mediaSource.readyState !== "open" || isCancelled.current)
              return;

            if (!sourceBuffer.updating) {
              try {
                sourceBuffer.appendBuffer(value);
              } catch (error) {
                if (error.name === "InvalidStateError") return;
                throw error;
              }
              sourceBuffer.addEventListener("updateend", () => pump(), {
                once: true,
              });
            } else {
              sourceBuffer.addEventListener("updateend", () => pump(), {
                once: true,
              });
            }
          };

          audio.play();
          pump();
        },
        { once: true },
      );

      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => {
        setIsSpeaking(false);
        alert("Error playing streamed audio");
      };
    } catch (error) {
      setIsSpeaking(false);
      alert("Error with streaming: " + error.message);
    }
  };

  const stopSpeaking = () => {
    isCancelled.current = true;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (readerRef.current) {
      readerRef.current.cancel();
    }
    if (
      mediaSourceRef.current &&
      mediaSourceRef.current.readyState === "open" &&
      !sourceBufferRef.current?.updating
    ) {
      mediaSourceRef.current.endOfStream();
    }
    setIsSpeaking(false);
  };

  useEffect(() => {
    return () => {
      isCancelled.current = true;
      if (audioRef.current) audioRef.current.pause();
      if (readerRef.current) readerRef.current.cancel();
      if (
        mediaSourceRef.current &&
        mediaSourceRef.current.readyState === "open" &&
        !sourceBufferRef.current?.updating
      ) {
        mediaSourceRef.current.endOfStream();
      }
    };
  }, []);

  useEffect(() => {}, []);

  return (
    <Button
      size="icon"
      onClick={isSpeaking ? stopSpeaking : () => speakText(text, speaker)}
      className={`group focus:outline-none bg-${customColor || "bg-green-500"} hover:bg-${customColor}/50 rounded-full transition-all duration-200 ${customCss} `}
      aria-label={isSpeaking ? "Stop speaking" : "Speak text"}
    >
      {!customCss === "speak" ? (
        <span>play</span>
      ) : (
        <Volume2
          className={`size-4 ${isSpeaking ? " " : ""} `}
          strokeWidth={1.5}
        />
      )}
    </Button>
  );
}
