"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useConversation } from "./hooks";
import { ConversationContainer } from "./conversation-container";

interface ConversationComponentProps {
  vocabulary: string[];
  dialogue: string;
  title: string;
  id: string;
  targetLanguage: string;
  nativeLanguage: string;
  userAvatarUrl?: string;
  aiAvatarMaleUrl: string;
  aiAvatarFemaleUrl: string;
}

export default function ConversationComponent({
  vocabulary,
  dialogue,
  title,
  id,
  targetLanguage,
  nativeLanguage,
  userAvatarUrl,
  aiAvatarMaleUrl,
  aiAvatarFemaleUrl,
}: ConversationComponentProps) {
  const { user } = useUser();
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [originalText, setOriginalText] = useState("");

  // Get everything from the hook
  const {
    voiceGender,
    conversationHistory,
    textInput,
    isRecording,
    isProcessing,
    isDeleting,
    isSaving,
    conversationStarted,
    conversationRecordId,
    translationResult,
    error,
    messagesEndRef,
    scrollRef,
    handleConversation,
    handleStartConversation,
    toggleRecording,
    clearConversationHistory,
    analyzeAndSaveConversation,
    speakPhrase,
    usePhrase,
    toggleVoiceGender,
    setTextInput,
    audioBase64Map,
    createAudioUrl
  } = useConversation({
    id,
    title,
    targetLanguage,
    nativeLanguage,
    vocabulary,
    dialogue,
    user: { id: user?.id || "" },
  });

  // Handle text input send
  const handleSend = async (text: string) => {
    if (text.trim()) {
      setOriginalText(text);
      await handleConversation(text);
      setTextInput("");
    }
  };

  // Handle translation (if you need this separate from handleConversation)
  const handleTranslation = async (text: string) => {
    // Implement translation logic if different from handleConversation
    setOriginalText(text);
    await handleConversation(text);
  };

  // Toggle voice gender wrapper
  const handleToggleVoiceGender = () => {
    toggleVoiceGender(voiceGender === "female");
  };

  return (
    <ConversationContainer
      // language helpers
      targetLanguage={targetLanguage}
      // State
      voiceGender={voiceGender}
      conversationHistory={conversationHistory}
      textInput={textInput}
      isRecording={isRecording}
      isProcessing={isProcessing}
      isDeleting={isDeleting}
      isSaving={isSaving}
      conversationStarted={conversationStarted}
      conversationRecordId={conversationRecordId}
      translationResult={translationResult}
      error={error}
      originalText={originalText}
      userAvatarUrl={userAvatarUrl || user?.imageUrl}
      aiAvatarMaleUrl={aiAvatarMaleUrl}
      aiAvatarFemaleUrl={aiAvatarFemaleUrl}
      // Handlers
      onToggleVoiceGender={handleToggleVoiceGender}
      onStartConversation={handleStartConversation}
      onTextChange={setTextInput}
      onSend={handleSend}
      onToggleRecording={toggleRecording}
      onClearHistory={clearConversationHistory}
      onSave={analyzeAndSaveConversation}
      speakPhrase={speakPhrase}
      usePhrase={usePhrase}
      handleTranslation={handleTranslation}
      audioBase64Map={audioBase64Map}
      createAudioUrl={createAudioUrl}
    />
  );
}