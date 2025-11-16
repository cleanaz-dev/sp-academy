// app/(dashboard)/conversation/[id]/page.jsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import NewConversationComponent from "./NewConversationComponent";

export default function SingleConversationPage({ conversation, id }) {
  return (
    <div className="min-h-screen animate-[gradient_6s_ease_infinite] bg-gradient-to-r from-sky-400 via-emerald-400 to-violet-400 bg-[length:300%_300%] py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-4xl"
        >
          {/* Header Section */}
          <div className="relative mb-8 h-64 overflow-hidden rounded-2xl">
            <Image
              src={conversation.imageUrl}
              alt={conversation.title}
              fill
              sizes="object-cover"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <h1 className="mb-2 text-4xl font-bold text-white">
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
            className="mb-8 rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800"
          >
            <h2 className="mb-4 text-2xl font-semibold">Introduction</h2>
            <div className="space-y-2">
              <p className="text-gray-700 dark:text-gray-300">
                {conversation.introduction.french}
              </p>
              <p className="italic text-gray-600 dark:text-gray-400">
                {conversation.introduction.english}
              </p>
            </div>
          </motion.div>
        </motion.div>
        <NewConversationComponent
          vocabulary={conversation.vocabulary}
          dialogue={conversation.dialogue}
          title={conversation.title}
          id={id}
          tutorLanguage={conversation.tutorLanguage}
        />
      </div>
    </div>
  );
}
