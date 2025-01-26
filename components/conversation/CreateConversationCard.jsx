// app/component/conversation/CreateConversationCard.jsx

import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function CreateConversationCard() {
  return (
    <div className="p-4">
      <Link href="/conversation/create">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-shadow duration-300 overflow-hidden">
          <div className="relative h-48 w-full bg-gradient-to-r from-sky-400 via-amber-400 to-emerald-400 flex items-center justify-center group">
            {/* Icon with Hover Effect */}
            <div className="flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg transition-transform group-hover:scale-110 duration-700">
              <PlusCircle className="h-10 w-10 text-sky-400 group-hover:text-emerald-400 transition-colors" />
            </div>
          </div>
          <div className="p-4">
            {/* Title */}
            <h3 className="text-gray-800 dark:text-gray-100 text-lg font-bold text-center">
              Start a New Conversation
            </h3>
            {/* Subtitle */}
            <p className="text-gray-600 dark:text-gray-300 text-sm italic text-center mt-2">
              Create a custom conversation and sharpen your skills!
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}
