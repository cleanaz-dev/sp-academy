// app/(dashboard)/conversation/page.jsx

import ConvAi from '@/components/conversation/ConvAI';
import ConversationCard from '@/components/conversation/ConversationCard';
import CreateConversationCard from '@/components/conversation/CreateConversationCard';
import { getAllConversations } from '@/lib/actions';

export default async function Page() {
  const conversations = await getAllConversations();

  return (
    <main className="">
      <header className="pb-8">
        <h1 className="header-title">Conversation 😄😶😏🙄</h1>
      </header>
      {/* <ConvAi />     */}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <CreateConversationCard />
        {conversations && conversations.map((conversation) => (
          <ConversationCard 
            key={conversation.id} 
            conversation={conversation}
          />
        ))}
      </div>
    </main>
  );
}