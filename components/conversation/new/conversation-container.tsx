import React, { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { VoiceGenderToggle } from "./voice-gender-toggle";
import { MessageBubble } from "./message-bubble";
import { InputControls } from "./input-controls";
import { SuggestionsPanel } from "./suggestions-panel";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { Message, VoiceGender } from "./types";

interface Props {
  // State
  targetLanguage: string;
  voiceGender: VoiceGender;
  conversationHistory: Message[];
  textInput: string;
  isRecording: boolean;
  isProcessing: boolean;
  isDeleting: boolean;
  isSaving: boolean;
  conversationStarted: boolean;
  conversationRecordId: string | null;
  translationResult: string | null;
  error: string | null;
  originalText: string;
  userAvatarUrl?: string;
  aiAvatarMaleUrl: string;
  aiAvatarFemaleUrl: string;
  audioBase64Map: Record<string, string>;
  

  // Handlers
  onToggleVoiceGender: () => void;
  onStartConversation: () => void;
  onTextChange: (value: string) => void;
  onSend: (text: string) => void;
  onToggleRecording: () => void;
  onClearHistory: () => void;
  onSave: () => void;
  speakPhrase: (text: string) => void;
  usePhrase: (text: string) => void;
  handleTranslation: (text: string) => void;
  createAudioUrl: (base64: string) => string;
}

export const ConversationContainer: React.FC<Props> = ({
  targetLanguage,
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
  originalText,
  userAvatarUrl,
  aiAvatarMaleUrl,
  aiAvatarFemaleUrl,
  onToggleVoiceGender,
  onStartConversation,
  onTextChange,
  onSend,
  onToggleRecording,
  onClearHistory,
  onSave,
  speakPhrase,
  usePhrase,
  handleTranslation,
  audioBase64Map,
  createAudioUrl,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationHistory, translationResult]);

  return (
    <div className="container mx-auto flex max-w-4xl gap-4">
      <div className="w-full">
        <div className="flex h-full flex-col rounded-lg bg-white p-4 shadow max-h-[1200px]">
          {/* Header with Voice Toggle */}
          <div className="flex items-center justify-between p-2">
            <header>
              <div>
                <h3 className="text-lg font-semibold">
                  Practice Conversation ✌🏼✌🏼✌🏼
                </h3>
                <VoiceGenderToggle
                  voiceGender={voiceGender}
                  onToggle={onToggleVoiceGender}
                />
              </div>
            </header>
          </div>

          {/* Conversation History */}
          <ScrollArea className="min-h-[100px] flex-1 rounded-lg bg-gray-100/80 p-4 shadow-inner">
            <div className="flex flex-col space-y-4">
              {conversationHistory.map((message, index) => (
                <MessageBubble
                  key={index}
                  message={message}
                  voiceGender={voiceGender}
                  aiAvatarMaleUrl={aiAvatarMaleUrl}
                  aiAvatarFemaleUrl={aiAvatarFemaleUrl}
                  userAvatarUrl={userAvatarUrl}
                  speakPhrase={speakPhrase}
                  audioBase64Map={audioBase64Map}
                  createAudioUrl={createAudioUrl}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="md:p-4">
            <InputControls
              textInput={textInput}
              isRecording={isRecording}
              isProcessing={isProcessing}
              conversationStarted={conversationStarted}
              conversationRecordId={conversationRecordId}
              onTextChange={onTextChange}
              onSend={onSend}
              onToggleRecording={onToggleRecording}
              onStartConversation={onStartConversation}
              targetLanguage={targetLanguage}
            />
          </div>

          {/* Error Messages */}
          {error && (
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 rounded-full border border-red-200 bg-red-100 px-4 py-2 text-sm text-red-700 shadow-lg">
              {error}
            </div>
          )}

          {/* Translation Result Display */}
          {translationResult && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">
                  Translation
                </h4>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-purple-50 p-3 shadow-inner shadow-purple-100"
              >
                <div className="flex w-full items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">
                      {translationResult}
                    </p>
                    <p className="text-xs italic text-gray-600">
                      {originalText}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => speakPhrase(translationResult)}
                      className="p-1 text-gray-600 hover:text-purple-600"
                    >
                      🔊
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => usePhrase(translationResult)}
                      className="p-1 text-gray-600 hover:text-purple-600"
                    >
                      💬
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Suggestions Panel */}
          <SuggestionsPanel
            conversationHistory={conversationHistory}
            speakPhrase={speakPhrase}
            usePhrase={usePhrase}
          />

          {/* Action Buttons */}
          {conversationHistory.length > 0 && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={onClearHistory}
                className="w-1/2 rounded bg-gray-500 p-2 text-white hover:bg-gray-600"
              >
                {isDeleting ? "Clearing..." : "Clear Conversation"}
              </button>
              <button
                onClick={onSave}
                disabled={isSaving}
                className={`flex w-1/2 items-center justify-center gap-2 rounded p-2 text-white ${
                  isSaving
                    ? "bg-purple-300"
                    : "bg-purple-500 hover:bg-purple-600"
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save & Analyze"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
