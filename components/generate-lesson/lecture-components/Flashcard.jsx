"use client";
import { useState } from "react";

export const Flashcard = ({ front, back }) => {
  const [showBack, setShowBack] = useState(false);

  return (
    <div
      className="mx-auto my-4 flex h-40 w-64 cursor-pointer items-center justify-center rounded-lg bg-white p-4 text-center shadow-lg transition-colors duration-200 hover:bg-gray-50"
      onClick={() => setShowBack(!showBack)}
    >
      {showBack ? (
        <div className="font-semibold text-red-600">{back}</div>
      ) : (
        <div className="font-semibold text-blue-600">{front}</div>
      )}
    </div>
  );
};
