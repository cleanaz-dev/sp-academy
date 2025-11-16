import ShinyStar from "@/components/old-ui/ShinyStar";
import { BookOpen, Mic, MessageSquare } from "lucide-react";
import React from "react";

export const Goals = ({ title, hook, objectives, explanation }) => {
  return (
    <section className="mx-auto max-w-4xl p-6">
      {/* Header */}
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-semibold text-gray-900">{title.french}</h1>
        <h2 className="mt-1 text-lg text-gray-500">{title.english}</h2>
      </header>

      {/* Hook Section with ShinyStar */}
      <div className="relative mb-6 rounded-md bg-blue-100 p-4 text-center">
        <ShinyStar className="absolute left-2 top-2" />
        <p className="pl-7 text-base text-gray-800">{hook.french}</p>
        <p className="mt-1 pl-7 text-sm italic text-gray-600">{hook.english}</p>
      </div>

      {/* Objectives Grid */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { icon: BookOpen, text: objectives.grammar, label: "Grammaire" },
          { icon: Mic, text: objectives.vocab, label: "Vocabulaire" },
          {
            icon: MessageSquare,
            text: objectives.communication,
            label: "Communication",
          },
        ].map(({ icon: Icon, text, label }, index) => (
          <div
            key={index}
            className="flex flex-col items-center rounded-md border border-gray-200 px-4 py-3"
          >
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-200">
              <Icon className="h-5 w-5 text-blue-700" />
            </div>
            <h3 className="mb-1 text-base font-medium text-gray-900">
              {label}
            </h3>
            <p className="text-center text-sm text-gray-800">{text.french}</p>
            <p className="mt-1 text-center text-xs italic text-gray-600">
              {text.english}
            </p>
          </div>
        ))}
      </div>

      {/* Explanation Section with ShinyStar */}
      <div className="relative rounded-md bg-blue-100 p-4 text-center">
        <ShinyStar className="absolute left-2 top-2" />
        <p className="pl-7 text-base text-gray-800">{explanation.french}</p>
        <p className="mt-1 pl-7 text-sm italic text-gray-600">
          {explanation.english}
        </p>
      </div>
    </section>
  );
};
