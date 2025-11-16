"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import NewConversationComponentCopy from "./NewConversationComponent-copy";
import ConversationComponent from "./new/new-conversation-component";

export default function SingleConversationPageCopy({
  conversation,
  id,
  avatarUrl,
}) {
  return (
    <div className="min-h-screen animate-[gradient_6s_ease_infinite] bg-gradient-to-r from-sky-400 via-emerald-400 to-violet-400 bg-[length:300%_300%] py-8">
      <div className="container mx-auto w-full max-w-5xl px-4">
        {" "}
        {/* Added max-w-5xl and w-full */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto w-full max-w-4xl" // Added w-full
        >
          {/* Header Section */}
          <div className="relative mb-8 h-48 w-full overflow-hidden rounded-2xl md:h-64">
            {" "}
            {/* Added w-full */}
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
              <h1 className="mb-2 text-2xl font-bold text-white md:text-4xl">
                {conversation.title}
              </h1>
              <p className="text-gray-200">
                {conversation.introduction.nativeLanguage}
              </p>
            </div>
          </div>
        </motion.div>
        {/* Pass the language information to NewConversationComponent */}
        <div className="mx-auto w-full max-w-5xl">
          {" "}
          {/* Ensure full width and center */}
          {/* <NewConversationComponentCopy
            userAvatarUrl={avatarUrl}
            aiAvatarMaleUrl={conversation.aiAvatarMaleUrl}
            aiAvatarFemaleUrl={conversation.aiAvatarFemaleUrl}
            vocabulary={conversation.vocabulary}
            dialogue={conversation.dialogue}
            title={conversation.title}
            id={id}
            tutorLanguage={conversation.tutorLanguage}
            targetLanguage={conversation.metadata?.languages?.target || "fr"}
            nativeLanguage={conversation.metadata?.languages?.native || "en"}
          /> */}
          <ConversationComponent 
           userAvatarUrl={avatarUrl}
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
