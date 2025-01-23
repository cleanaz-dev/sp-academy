// components/ConversationCard.jsx
"use client";

import Link from "next/link";
import Image from "next/image";

export default function ConversationCard({ conversation }) {
  return (
    <div className="p-4">
      <Link href={`/conversation/${conversation.id}`}>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-shadow duration-300">
          <div className="relative h-48 w-full">
            <Image
              src={conversation.imageUrl}
              alt={conversation.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-white text-xl font-bold">
                {conversation.title}
              </h3>
              <p className="text-gray-200 text-sm mt-2">
                {conversation.introduction.english}
              </p>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full text-sm">
                French
              </span>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-sm">
              Vocabulary Words
              </span>
              <span className="px-3 py-1 bg-emerald-100 dark:bg-blue-900 text-emerald-600 dark:text-blue-300 rounded-full text-sm">
                Beginner
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm italic">
              {conversation.introduction.french}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}
