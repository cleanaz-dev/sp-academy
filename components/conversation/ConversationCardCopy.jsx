// components/ConversationCard.jsx
"use client";

import Link from "next/link";
import Image from "next/image";

export default function ConversationCardCopy({ conversation }) {
  return (
    <div className="w-full p-4">
      <Link href={`/conversation/${conversation.id}`}>
        <div className="cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow duration-300 hover:shadow-md dark:bg-gray-800">
          <div className="group relative aspect-[16/9] w-full overflow-hidden">
            <Image
              src={conversation.imageUrl}
              alt={conversation.title}
              fill
              sizes="33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="truncate text-lg font-bold text-white sm:text-xl">
                {conversation.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-gray-200 sm:mt-2">
                {conversation.introduction.nativeLanguage}
              </p>
            </div>
          </div>
          <div className="flex flex-col p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                {conversation.tutorLanguage.toLowerCase()}
              </span>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-600 dark:bg-blue-900 dark:text-blue-300">
                {conversation.level.toLowerCase()}
              </span>
            </div>
            <p className="min-h-[5rem] flex-grow text-sm italic text-gray-600 dark:text-gray-300">
              {conversation.introduction.targetLanguage}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}
