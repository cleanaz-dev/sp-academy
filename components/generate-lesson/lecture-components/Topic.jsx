import React from "react";
import { BookOpen, ArrowRight } from "lucide-react";

export const Topic = ({ french, english }) => {
  return (
    <div className="mx-auto mb-10 max-w-4xl rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm">
      <div className="mb-6 flex justify-center">
        <div className="h-px w-8 self-center bg-gradient-to-r from-transparent to-blue-500/70"></div>
        <div className="mx-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
          <BookOpen className="h-6 w-6 text-white" />
        </div>
        <div className="h-px w-8 self-center bg-gradient-to-l from-transparent to-blue-500/70"></div>
      </div>

      <div className="mb-5">
        <span className="inline-block border-b-2 border-blue-400 pb-2 text-2xl font-bold text-gray-800">
          {french || ""}
        </span>
      </div>

      <div className="mb-4 flex items-center justify-center">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
          <ArrowRight className="h-3 w-3 text-blue-600" />
        </div>
      </div>

      <div className="mx-auto max-w-2xl rounded-lg border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 shadow-inner">
        <p className="text-base font-medium italic leading-relaxed text-gray-700">
          {english || ""}
        </p>
      </div>
    </div>
  );
};
