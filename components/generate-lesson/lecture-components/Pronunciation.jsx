import PronunciationTestFR from "@/components/lessons/PronuncationTestFR";
import React, { useState } from "react";
import { Speech, Check, Award, Activity } from "lucide-react";
import { PronunciationText } from "@/lib/constants";

// Helper function to convert CEFR level to a numeric score for visualization
const cefrToScore = (cefr) => {
  const scores = {
    A1: 17,
    A2: 34,
    B1: 50,
    B2: 67,
    C1: 84,
    C2: 100,
  };
  return scores[cefr] || 0;
};

export const Pronunciation = ({ title, items }) => {
  const [hoveredItem, setHoveredItem] = useState(null);

  // Mock Speechace results for each item
  // In a real implementation, this would be fetched or passed as props
  const mockResults = items.map((item, index) => ({
    status: "success",
    text_score: {
      text: item.targetText,
      word_score_list: [
        // This would contain word-level details in actual implementation
        { pronunciation_score: 75 + Math.floor(Math.random() * 20) },
      ],
      speechace_score: {
        pronunciation: 70 + Math.floor(Math.random() * 25),
      },
      cefr_score: {
        pronunciation: ["A1", "A2", "B1", "B2", "C1", "C2"][
          Math.floor(Math.random() * 6)
        ],
      },
    },
  }));

  return (
    <section className="mx-auto max-w-4xl rounded-xl bg-white p-8">
      <header className="mb-10 text-center">
        <div className="mb-3 flex items-center justify-center gap-2">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-purple-500/70"></div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
            <Speech className="h-5 w-5 text-purple-600" />
          </div>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-purple-500/70"></div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {title.french}
        </h1>
        <h2 className="mt-2 text-lg font-medium text-gray-600">
          {title.english}
        </h2>
      </header>

      <div className="mb-8 grid grid-cols-2 gap-6">
        {items.map((item, index) => {
          // Get the mock result for this item
          const result = mockResults[index];
          const pronunciationScore =
            result.text_score.speechace_score.pronunciation;
          const cefrLevel = result.text_score.cefr_score.pronunciation;
          const fluencyScore = cefrToScore(cefrLevel);
          // For intonation, in a real app we would calculate from word_score_list
          // Here we'll just use a mock value
          const intonationScore = 65 + Math.floor(Math.random() * 25);

          return (
            <div
              key={index}
              className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md"
              onMouseEnter={() => setHoveredItem(index)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {/* Card header */}
              <div className="border-b border-gray-100 bg-gray-50 px-6 py-4 hover:border-blue-200">
                <div className="grid grid-cols-2">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-blue-800">
                      Greeting {index + 1}
                    </span>
                  </div>
                </div>
              </div>

              {/* Target text and pronunciation test */}
              <div className="p-6">
                <div className="mb-6">
                  {/* <div className="text-xl text-center font-medium text-gray-800 mb-2">
                    {item.targetText}
                  </div> */}
                  <div
                    className={`transition-all duration-300 ${
                      hoveredItem === index ? "scale-102 transform" : ""
                    }`}
                  >
                    <PronunciationTestFR targetText={item.targetText} />
                  </div>
                </div>

                {/* Result visualization */}
              </div>
            </div>
          );
        })}
      </div>
      <div className="rounded-md border">
        <div className="border-b bg-gray-50 py-6 text-center">
          <span className="text-xl font-semibold text-gray-800">
            Understanding Your Results
          </span>
        </div>

        {/* Tips section */}
        <div className="grid grid-cols-1 md:grid-cols-3">
          {PronunciationText.map((tip, index) => {
            const { title, text, icon, color } = tip; // Destructure here
            return (
              <div
                key={index} // Use a unique key, ideally tip.id
                className="group mx-4 my-8 flex flex-col overflow-hidden rounded-xl bg-gray-50"
              >
                <div className={``}>
                  <div className="px-6 pb-4 transition-all duration-500 group-hover:scale-105">
                    <h3>
                      <span className="flex items-center justify-start gap-2">
                        {icon}
                        <span className="text-base font-medium text-gray-800">
                          {title}
                        </span>
                      </span>
                    </h3>
                  </div>
                </div>

                <div className="px-6 pb-4">
                  <p className="text-xs text-gray-600 transition-all duration-500 group-hover:scale-110">
                    {text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add the following CSS to your global styles */}
      <style jsx global>{`
        @keyframes pulse {
          0% {
            transform: scaleY(0.8);
          }
          100% {
            transform: scaleY(1.2);
          }
        }
      `}</style>
    </section>
  );
};
