"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import NewConversationComponentCopy from "./NewConversationComponent-copy";

export default function SingleConversationPageCopy({ conversation, id }) {
  return (
    <div className="min-h-screen bg-gradient-to-r from-sky-400 via-emerald-400 to-violet-400 bg-[length:300%_300%] animate-[gradient_6s_ease_infinite] py-8">
      <div className="container mx-auto px-4 w-full max-w-5xl"> {/* Added max-w-5xl and w-full */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto w-full" // Added w-full
        >
          {/* Header Section */}
          <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden mb-8 w-full"> {/* Added w-full */}
            <Image
              src={conversation.imageUrl}
              alt={conversation.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
                {conversation.title}
              </h1>
              <p className="text-gray-200">
                {conversation.introduction.nativeLanguage}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Pass the language information to NewConversationComponent */}
        <div className="w-full max-w-5xl mx-auto"> {/* Ensure full width and center */}
          <NewConversationComponentCopy
            aiAvatarUrl={conversation.aiAvatarUrl}
            aiAvatarMaleUrl={conversation.aiAvatarMaleUrl}
            aiAvatarFemaleUrl={conversation.aiAvatarFemaleUrl}
            vocabulary={conversation.vocabulary}
            dialogue={conversation.dialogue}
            title={conversation.title}
            id={id}
            tutorLanguage={conversation.tutorLanguage}
            targetLanguage={conversation.metadata?.languages?.target || "fr"}
            nativeLanguage={conversation.metadata?.languages?.native || "en"}
          />
        </div>
      </div>
    </div>
  );
}