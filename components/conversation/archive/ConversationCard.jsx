// components/ConversationCard.jsx
"use client";

import Link from "next/link";
import Image from "next/image";

export default function ConversationCard({ conversation }) {
  return (
    <div className="p-4">
      <Link href={`/conversation/${conversation.id}`}>
        <div className="cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow duration-300 hover:shadow-md dark:bg-gray-800">
          <div className="group relative h-48 w-full overflow-hidden">
            <Image
              src={conversation.imageUrl}
              alt={conversation.title}
              sizes="object-fit-cover"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-xl font-bold text-white">
                {conversation.title}
              </h3>
              <p className="mt-2 text-sm text-gray-200">
                {conversation.introduction.english}
              </p>
            </div>
          </div>
          <div className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                {conversation.tutorLanguage.toLowerCase()}
              </span>
              {/* <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-sm">
                Vocabulary Words
              </span> */}
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-600 dark:bg-blue-900 dark:text-blue-300">
                {conversation.level.toLowerCase()}
              </span>
            </div>
            <p className="min-h-20 text-sm italic text-gray-600 dark:text-gray-300">
              {conversation.introduction.french}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}
