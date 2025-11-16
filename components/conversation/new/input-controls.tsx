import React from 'react';
import { Send, Mic, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  textInput: string;
  isRecording: boolean;
  isProcessing: boolean;
  conversationStarted: boolean;
  conversationRecordId: string | null;
  onTextChange: (value: string) => void;
  onSend: (text: string) => void;
  onToggleRecording: () => void;
  onStartConversation: () => void;
}

export const InputControls: React.FC<Props> = ({
  textInput,
  isRecording,
  isProcessing,
  conversationStarted,
  conversationRecordId,
  onTextChange,
  onSend,
  onToggleRecording,
  onStartConversation,
}) => {
  const showInput = conversationStarted && conversationRecordId;
  const hasText = textInput.trim().length > 0;

  // Determine which status to show
  const getStatusContent = () => {
    if (isProcessing) {
      return (
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          <span className="text-sm font-medium text-blue-600">Processing</span>
        </div>
      );
    }

    if (isRecording) {
      return (
        <div className="flex items-center justify-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
          </span>
          <span className="text-sm font-medium text-red-600">Recording</span>
        </div>
      );
    }

    if (!conversationStarted) {
      return (
        <div className="flex items-center justify-center gap-2">
          <Button variant='ghost' onClick={onStartConversation}>
            <span className="text-sm font-medium">Ready to start! 🚀</span>
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Status Area - Single element that changes content */}
      <div className="flex h-8 items-center justify-center">
        {getStatusContent()}
      </div>

      {/* Input Controls */}
      {showInput && (
        <div className="flex items-center gap-4">
          <div className="flex w-full flex-1 items-center rounded-full bg-gray-100 p-2 shadow-inner">
            {/* Text Input */}
            <input
              type="text"
              value={textInput}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder="Type something to translate..."
              className="w-full flex-1 bg-transparent px-3 text-sm outline-none"
            />

            {/* Action Button */}
            {hasText ? (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onSend(textInput)}
                disabled={isProcessing || !hasText}
                className="rounded-full p-2 text-emerald-500 hover:bg-emerald-500 hover:text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="icon"
                variant="ghost"
                onClick={onToggleRecording}
                disabled={isProcessing}
                className={`rounded-full p-2 ${
                  isRecording 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'text-blue-500 hover:bg-blue-500 hover:text-white'
                }`}
              >
                <Mic className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};