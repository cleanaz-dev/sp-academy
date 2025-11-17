"use client";

import ConversationWithAi from "@/components/lessons/ConversationWithAi";
import SpeakingModule from "@/components/lessons/SpeakingModule";
import { Volume2 } from "lucide-react";
import {
  Star,
  MessageCircle,
  BookOpen,
  Users,
  ArrowRight,
  Check,
  Play,
} from "lucide-react";
import React, { useState, useEffect } from "react";

export const Dialogue = ({ title, lines, analysis, evenColor, oddColor }) => {
  const fullDialogueText = lines.map((line) => line.french).join(" ");
  const fullDialogueSpeakers = lines.map((line) => line.speaker).join(", ");

  // Default colors if not provided
  const defaultEvenColor = "blue-500";
  const defaultOddColor = "purple-500";

  // Use provided colors or defaults
  const evenColorClass = evenColor || defaultEvenColor;
  const oddColorClass = oddColor || defaultOddColor;

  return (
    <section className="mx-auto max-w-4xl rounded-xl bg-white p-8">
      <header className="mb-10 text-center">
        <div className="mb-3 flex items-center justify-center gap-2">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-indigo-500/70"></div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
            <MessageCircle className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-indigo-500/70"></div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {title.french}
        </h1>
        <h2 className="mt-2 text-lg font-medium text-gray-600">
          {title.english}
        </h2>
      </header>

      {/* Phone-style chat UI */}
      <div className="mb-8 bg-white p-6">
        {/* Elegant header */}
        <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500">
            <Users className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            French Conversation
          </h3>
        </div>

        {/* Premium dialogue lines */}
        <div className="space-y-4">
          {lines.map((line, index) => {
            const isEven = index % 2 === 0;
            const gradientBg = isEven
              ? "bg-gradient-to-r from-blue-50 to-indigo-50"
              : "bg-gradient-to-br from-white via-white to-amber-50";
            const accentColor = isEven ? "indigo-600" : "blue-500";

            return (
              <div
                key={index}
                className={`rounded-lg ${gradientBg} overflow-hidden transition-all hover:shadow-sm`}
              >
                <div className="p-5">
                  {/* Speaker name with premium styling */}
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-8 w-2 rounded-full bg-${accentColor}`}
                      ></div>
                      <span className="font-medium text-gray-800">
                        {line.speaker}
                      </span>
                    </div>

                    {/* Elegant speaking module */}
                    <SpeakingModule
                      text={line.french}
                      speaker={isEven ? "Female" : "Male"}
                      language="fr-FR"
                      customColor={accentColor}
                      index={index}
                    />
                  </div>

                  {/* Content with improved typography */}
                  <div className="ml-4">
                    <p className="mb-2 text-lg font-medium leading-relaxed text-gray-800">
                      {line.french}
                    </p>
                    <p className="italic text-gray-500">{line.english}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Premium play all button */}
        <div className="mt-6 flex justify-center">
          <button
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-white shadow-md transition-all hover:shadow-lg"
            onClick={() => playAllInSequence(lines)}
          >
            <Play className="h-4 w-4" />
            <span className="font-medium">Listen to Conversation</span>
          </button>
        </div>
      </div>

      {/* Practice section */}
      <div className="mb-8 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5">
        <div className="mb-3">
          <h3 className="text-md mb-1 font-semibold text-gray-800">
            Practice this conversation
          </h3>
          <p className="text-sm text-gray-600">
            Speak with our AI conversation partner to practice your
            pronunciation and fluency
          </p>
        </div>
        {/* <ConversationWithAi /> */}
      </div>

      {/* Analysis section */}
      {analysis ? (
        <div className="relative p-6">
          <div className="flex w-full flex-col rounded-full bg-gradient-to-tr from-transparent via-slate-50/10 to-amber-300/10 pl-6">
            <div className="flex items-center justify-between">
              <div>
                <h3> Analysis </h3>
              </div>{" "}
              <div>
                {analysis?.french && (
                  <div
                    className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm transition-all duration-200 hover:scale-110 hover:bg-amber-600"
                    aria-label="Listen to analysis"
                  >
                    <Volume2 className="h-4 w-4" />
                    <span className="sr-only">Listen to analysis</span>
                    <div className="absolute opacity-0">
                      <SpeakingModule
                        text={analysis.french + " - " + analysis.english}
                        speaker="Marie"
                        language="fr-FR"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col">
              <p className="text-base font-medium leading-relaxed text-gray-800">
                {analysis.french || ""}
              </p>
              <p className="mt-2 text-sm italic text-gray-600">
                {analysis.english || ""}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};
