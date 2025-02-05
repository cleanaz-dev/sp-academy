// components/ConversationCard.jsx
"use client";

import Link from "next/link";
import Image from "next/image";

export default function ConversationCardCopy({ conversation }) {
  return (
    <div className="p-4 w-full ">
  <Link href={`/conversation/${conversation.id}`}>
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-shadow duration-300 overflow-hidden">
      <div className="relative aspect-[16/9] w-full group overflow-hidden">
        <Image
          src={conversation.imageUrl}
          alt={conversation.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white text-lg sm:text-xl font-bold truncate">
            {conversation.title}
          </h3>
          <p className="text-gray-200 text-sm mt-1 sm:mt-2 line-clamp-2">
            {conversation.introduction.nativeLanguage}
          </p>
        </div>
      </div>
      <div className="p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full text-sm">
            {conversation.tutorLanguage.toLowerCase()}
          </span>
          <span className="px-3 py-1 bg-emerald-100 dark:bg-blue-900 text-emerald-600 dark:text-blue-300 rounded-full text-sm">
            {conversation.level.toLowerCase()}
          </span>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-sm italic min-h-[5rem] flex-grow">
          {conversation.introduction.targetLanguage}
        </p>
      </div>
    </div>
  </Link>
</div>
  );
}
