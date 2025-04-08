"use client";

import React, { useState, useEffect, useRef } from "react";
import SpeakingModule from "@/components/lessons/SpeakingModule";
import {
  Play,
  Pause,
  Brain,
  Globe,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import Image from "next/image";

export const AiTutor = ({ data }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [language, setLanguage] = useState("french");
  const canvasRef = useRef(null);

  // Extract data from props
  const title = data?.title || { french: "", english: "" };
  const content = data?.content || { french: "", english: "" };
  const avatarUrl = data?.avatarUrl;

  const currentContent = content[language] || "";
  const currentTitle = title[language] || "";

  // Toggle language
  const toggleLanguage = () => {
    setLanguage(language === "french" ? "english" : "french");
    if (isPlaying) setIsPlaying(false);
  };

  // For the audio visualizer animation
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let animationId;
    const bars = 60;
    const barWidth = canvas.width / bars;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < bars; i++) {
        // Generate a dynamic height
        const height = isPlaying
          ? (Math.sin(i * 0.15 + Date.now() * 0.005) * 0.5 + 0.5) *
            canvas.height *
            0.8
          : Math.random() * canvas.height * 0.2;

        // Create a gradient fill
        const gradient = ctx.createLinearGradient(
          0,
          canvas.height,
          0,
          canvas.height - height,
        );

        if (language === "french") {
          gradient.addColorStop(0, "rgba(59, 130, 246, 0.6)"); // blue-500
          gradient.addColorStop(1, "rgba(96, 165, 250, 0.3)"); // blue-400
        } else {
          gradient.addColorStop(0, "rgba(139, 92, 246, 0.6)"); // purple-500
          gradient.addColorStop(1, "rgba(167, 139, 250, 0.3)"); // purple-400
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(
          i * barWidth,
          canvas.height - height,
          barWidth - 1,
          height,
        );
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying, language, canvasRef.current]);

  const handlePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <section className="mx-auto max-w-4xl rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
      <header className="mb-10 text-center">
        <div className="mb-3 flex items-center justify-center gap-2">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-blue-500/70"></div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <Brain className="h-5 w-5 text-blue-600" />
          </div>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-blue-500/70"></div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {title.french}
        </h1>
        <h2 className="mt-2 text-lg font-medium text-gray-600">
          {title.english}
        </h2>

        <div className="mt-4 inline-flex">
          <button
            onClick={toggleLanguage}
            className={`px-4 py-1.5 text-sm font-medium transition-colors ${
              language === "french"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            } rounded-l-full`}
          >
            Français
          </button>
          <button
            onClick={toggleLanguage}
            className={`px-4 py-1.5 text-sm font-medium transition-colors ${
              language === "english"
                ? "bg-purple-100 text-purple-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            } rounded-r-full`}
          >
            English
          </button>
        </div>
      </header>

      <div className="mb-8 grid grid-cols-1 gap-6">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50/50 shadow-sm transition-all duration-200 hover:border-blue-200 hover:bg-blue-50/30 hover:shadow">
          {/* AI profile */}
          <div className="flex items-center justify-between border-b border-gray-200 p-5">
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-blue-100">
                  <Image
                    src={avatarUrl}
                    alt="AI Tutor"
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <Brain className="h-5 w-5 text-blue-600" />
                </div>
              )}
              <div>
                <h3 className="text-md font-semibold text-gray-800">
                  AI Tutor
                </h3>
                <p className="text-xs text-gray-500">Language Assistant</p>
              </div>
            </div>

            <div className="flex items-center">
              <button
                onClick={handlePlayback}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                  isPlaying
                    ? "bg-red-100 text-red-600"
                    : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                } transition-colors`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-3 w-3" />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3" />
                    <span>Listen</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Audio Visualizer */}
          <div className="px-6 pt-4">
            <div className="h-16 overflow-hidden rounded-lg border border-gray-200 bg-white/80">
              <canvas ref={canvasRef} className="h-full w-full"></canvas>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-3 text-lg font-medium text-gray-800">
              {currentTitle}
            </div>
            <div className="leading-relaxed text-gray-600">
              <p>{currentContent}</p>
            </div>

            {/* Hidden speaking module */}
            <div className="absolute opacity-0">
              <SpeakingModule
                text={currentContent}
                speaker={language === "french" ? "Marie" : "Daniel"}
                language={language === "french" ? "fr-FR" : "en-US"}
              />
            </div>
          </div>

          {/* Question input */}
          <div className="border-t border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={
                  language === "french"
                    ? "Posez une question..."
                    : "Ask a question..."
                }
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <button className="rounded-lg bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700">
                <MessageSquare className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="relative rounded-xl border border-blue-200 bg-blue-50 p-6 shadow-inner">
        <div className="absolute -left-1 -top-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-300 to-blue-500 shadow-md">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
        </div>
        <div className="pl-6">
          <h3 className="text-md mb-2 font-semibold text-gray-800">
            {language === "french" ? "Conseil d'apprentissage" : "Learning Tip"}
          </h3>
          <p className="text-sm text-gray-700">
            {language === "french"
              ? "Écoutez attentivement la prononciation et essayez de répéter les phrases à voix haute pour pratiquer."
              : "Listen carefully to the pronunciation and try repeating the phrases aloud for practice."}
          </p>
        </div>
      </div>
    </section>
  );
};
