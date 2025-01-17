//components/chat-bot/Chatbot.jsx

"use client"
import { useState, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (message) => {
    setLoading(true);
    
    // Add user message to chat
    const newMessages = [...messages, { text: message, sender: 'user' }];
    setMessages(newMessages);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationHistory: messages,
        }),
      });

      const data = await response.json();
      
      // Add bot response to chat
      setMessages([...newMessages, { text: data.response, sender: 'bot' }]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[90vh] w-full max-w-2xl mx-auto border rounded-lg">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}
        {loading && <div className="text-center">...</div>}
      </div>
      <ChatInput onSend={sendMessage} disabled={loading} />
    </div>
  );
}
