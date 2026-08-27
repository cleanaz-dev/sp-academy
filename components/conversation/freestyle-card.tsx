// components/conversation/FreestyleCard.jsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Mic, Timer, Sparkles } from "lucide-react";

export default function FreestyleCard() {
  return (
    <div className="w-full p-4">
      <Link href="/conversation/freestyle">
        <div className="cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-gray-800">
          
          {/* Top Hero Section of the Card */}
          <div className="group relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
            
            {/* Cover Image */}
            <Image
              src="/freestyle-cover.png"
              alt="Freestyle Arena"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Decorative background glowing orbs */}
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-3xl transition-transform duration-700 group-hover:scale-150"></div>
            <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-black/20 blur-3xl transition-transform duration-700 group-hover:scale-150"></div>

            {/* Gradient Overlay & Text */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
                <h3 className="truncate text-lg font-bold text-white sm:text-xl drop-shadow-md">
                  Freestyle Arena
                </h3>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-gray-200 sm:mt-2">
                Test your unscripted fluency against our AI.
              </p>
            </div>
          </div>

          {/* Bottom Info Section */}
          <div className="flex flex-col p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                <Timer className="h-3.5 w-3.5" /> 3 Minutes
              </span>
              <span className="flex items-center gap-1 rounded-full bg-pink-100 px-3 py-1 text-sm font-medium text-pink-700 dark:bg-pink-900 dark:text-pink-300">
                Advanced AI
              </span>
            </div>
            <p className="min-h-[5rem] flex-grow text-sm italic text-gray-600 dark:text-gray-300">
              No scripts. No safety nets. Just you and the AI for 180 seconds. Get a comprehensive review from DeepSeek when you finish!
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}