// app/(dashboard)/conversation/page.jsx

import ConversationCard from "@/components/conversation/archive/ConversationCard";
import ConversationCardCopy from "@/components/conversation/ConversationCardCopy";
import CreateConversationCard from "@/components/conversation/CreateConversationCard";
import { getAllConversations } from "@/lib/actions";

export default async function Page() {
  const conversations = await getAllConversations();
  if (!conversations) return null;

  return (
    <main className="">
      <header className="pb-8">
        <h1 className="header-title">Conversation 😄😶😏🙄</h1>
      </header>
      {/* <ConvAi />     */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <CreateConversationCard />
        {/* {conversations &&
          conversations.map((conversation) => (
            <ConversationCard
              key={conversation.id}
              conversation={conversation}
            />
          ))} */}
       
          {conversations &&
            conversations
              .filter(
                (conversation) => conversation.metadata !== null
              )
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
