"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const Summary = (data) => {
  const { topics } = data || {};
  const [activeTopic, setActiveTopic] = useState(0);
  const [language, setLanguage] = useState("french");

  if (!data || !topics || topics.length === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <div className="mb-4 inline-block rounded-full bg-red-100 p-4 text-red-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">
          No topic data available
        </h3>
        <p className="mt-1 text-gray-500">
          Please provide valid topic information to display.
        </p>
      </div>
    );
  }

  const toggleLanguage = () => {
    setLanguage(language === "french" ? "english" : "french");
  };

  if (!data) {
    <div>Loading...</div>;
  }

  return (
    <div className="mx-auto my-8 max-w-4xl overflow-hidden rounded-2xl bg-white">
      {/* Header with language toggle */}
      <div className="p-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h2 className="text-2xl text-blue-500">
            {language === "french"
              ? "Résumés Éducatifs"
              : "Educational Summaries"}
          </h2>
          <button
            onClick={toggleLanguage}
            className="inline-flex items-center rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-blue-500 transition-colors hover:bg-white/30"
          >
            <span className="">
              {language === "french" ? "🇫🇷 Français" : "🇬🇧 English"}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="ml-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Topic Tabs */}
      <div className="overflow-x-auto border-b border-gray-200 bg-white">
        <div className="flex whitespace-nowrap px-4">
          {topics.map((topic, index) => (
            <button
              key={index}
              onClick={() => setActiveTopic(index)}
              className={`relative px-6 py-4 text-sm font-medium transition-colors ${
                activeTopic === index
                  ? "text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {topic.title[language]}
              {activeTopic === index && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                  initial={false}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTopic}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {topics[activeTopic] && (
              <>
                {/* Summary Box */}
                <div className="mb-6 rounded-xl border border-gray-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-indigo-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <span className="text-xl font-semibold text-gray-900">
                        {language === "french" ? "Résumé" : "Summary"}
                      </span>
                    </div>
                  </div>
                  <p className="leading-relaxed text-gray-700">
                    {topics[activeTopic].summary[language]}
                  </p>
                </div>

                {/* Key Points */}

                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-lg font-medium text-gray-900">
                    {language === "french" ? "Points Clés" : "Key Points"}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {topics[activeTopic].keyPoints.map((point, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="group min-h-20 rounded-lg border border-gray-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 transition-all duration-300 group-hover:scale-125 group-hover:bg-green-500/50">
                          <span className="text-xs font-bold text-blue-600 group-hover:text-white">
                            {index + 1}
                          </span>
                        </div>
                        <span className="text-gray-700">{point[language]}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer with actions */}
      <div className="border-t border-indigo-100 bg-white p-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-sm text-gray-500">
            {language === "french"
              ? `${topics.length} sujets disponibles pour l'étude`
              : `${topics.length} topics available for study`}
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              {language === "french"
                ? "Ajouter aux favoris"
                : "Add to favorites"}
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              {language === "french" ? "Commencer à étudier" : "Start studying"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
