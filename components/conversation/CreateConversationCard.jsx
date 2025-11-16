// app/component/conversation/CreateConversationCard.jsx

import { Card, CardContent } from "@/components/old-ui/card";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function CreateConversationCard() {
  return (
    <div className="p-4">
      <Link href="/conversation/create">
        <div className="cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow duration-300 hover:shadow-md dark:bg-gray-800">
          <div className="group relative flex h-48 w-full items-center justify-center bg-gradient-to-r from-sky-400 via-amber-400 to-emerald-400">
            {/* Icon with Hover Effect */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg transition-transform duration-700 group-hover:scale-110">
              <PlusCircle className="h-10 w-10 text-sky-400 transition-colors group-hover:text-emerald-400" />
            </div>
          </div>
          <div className="p-4">
            {/* Title */}
            <h3 className="text-center text-lg font-bold text-gray-800 dark:text-gray-100">
              Start a New Conversation
            </h3>
            {/* Subtitle */}
            <p className="mt-2 text-center text-sm italic text-gray-600 dark:text-gray-300">
              Create a custom conversation and sharpen your skills!
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}
