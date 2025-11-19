// app/(dashboard)/conversation/page.jsx

import ConversationCard from "@/components/conversation/archive/ConversationCard";
import ConversationCardCopy from "@/components/conversation/ConversationCardCopy";
import CreateConversationCard from "@/components/conversation/CreateConversationCard";
import { getAllConversations } from "@/lib/actions";
import { MessagesSquare } from "lucide-react";

export default async function Page() {
  const conversations = await getAllConversations();
  if (!conversations) return null;

  return (
    <main className="">
      <header className="mb-8 animate-[gradient_6s_ease_infinite] bg-gradient-to-r from-sky-400 via-emerald-400 to-violet-400 bg-[length:300%_300%] py-16 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="mb-4 flex items-center gap-4 text-4xl font-bold">
            Conversations{" "}
            <MessagesSquare
              strokeWidth={1.5}
              className="size-10 drop-shadow-xl"
            />
          </h1>
          <p className="text-xl opacity-90">
            Practice and improve your language skills through engaging
            conversations with our AI. Explore new vocabulary and gain
            confidence in expressing yourself!
          </p>
        </div>
      </header>
      {/* <ConvAi />     */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* <CreateConversationCard /> */}


        {conversations &&
          conversations
            .filter((conversation) => conversation.metadata !== null)
            .map((conversation) => (
              <ConversationCardCopy
                key={conversation.id}
                conversation={conversation}
              />
            ))}
      </div>
    </main>
  );
}
