// app/(dashboard)/conversation/[id]/page.jsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import NewConversationComponent from "./NewConversationComponent";

export default function SingleConversationPage({ conversation, id }) {
  return (
    <div className="min-h-screen bg-gradient-to-r from-sky-400 via-emerald-400 to-violet-400 bg-[length:300%_300%] animate-[gradient_6s_ease_infinite] py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header Section */}
          <div className="relative h-64 rounded-2xl overflow-hidden mb-8">
            <Image
              src={conversation.imageUrl}
              alt={conversation.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <h1 className="text-4xl font-bold text-white mb-2">
                {conversation.title}
              </h1>
              <p className="text-gray-200">
                {conversation.introduction.english}
              </p>
            </div>
          </div>

          {/* Introduction Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 shadow-lg"
          >
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <div className="space-y-2">
              <p className="text-gray-700 dark:text-gray-300">
                {conversation.introduction.french}
              </p>
              <p className="text-gray-600 dark:text-gray-400 italic">
                {conversation.introduction.english}
              </p>
            </div>
          </motion.div>
        </motion.div>
       
        <div className="w-full">
          <NewConversationComponent
            vocabulary={conversation.vocabulary}
            dialogue={conversation.dialogue}
            title={conversation.title}
            id={id}
          />
        </div>
      </div>
    </div>
  );
}
