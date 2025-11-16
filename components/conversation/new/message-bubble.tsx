import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { capitalizeFirstLetter } from './utils';
import { ImprovementTooltip } from './improvement-tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MdRecordVoiceOver } from 'react-icons/md';
import type { Message, VoiceGender } from './types';

interface Props {
  message: Message;
  voiceGender: VoiceGender;
  aiAvatarMaleUrl: string;
  aiAvatarFemaleUrl: string;
  userAvatarUrl?: string;
  speakPhrase: (text: string) => void;
}

export const MessageBubble: React.FC<Props> = ({
  message,
  voiceGender,
  aiAvatarMaleUrl,
  aiAvatarFemaleUrl,
  userAvatarUrl,
  speakPhrase,
}) => {
  const isUser = message.role === 'user';
  const showAIAvatar = !isUser && voiceGender === 'female';
  const showMaleAvatar = !isUser && voiceGender === 'male';

  return (
    <div
      className={cn(
        'flex items-end',
        isUser ? 'justify-end' : 'justify-start',
      )}
    >
      {showAIAvatar && (
        <Avatar className="mr-3 h-10 w-10 transform drop-shadow-md">
          <AvatarImage src={aiAvatarFemaleUrl} />
          <AvatarFallback className="bg-blue-500 text-white">AI</AvatarFallback>
        </Avatar>
      )}

      {showMaleAvatar && (
        <Avatar className="mr-3 h-10 w-10 transform drop-shadow-md">
          <AvatarImage src={aiAvatarMaleUrl} />
          <AvatarFallback className="bg-gray-500 text-white">U</AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          'relative rounded-2xl px-4 py-3 text-sm shadow-md md:max-w-[75%]',
          isUser
            ? 'min-w-32 self-end rounded-br-none bg-gradient-to-br from-blue-500 to-indigo-500 text-white'
            : 'self-start rounded-bl-none bg-white text-gray-900',
        )}
      >
        <p className="font-medium">
          {capitalizeFirstLetter(message.content)}
        </p>

        {message.translation && (
          <p className="mt-1 text-xs italic opacity-80">
            {message.translation}
          </p>
        )}

        {message.label && (
          <div className="flex items-center justify-end space-x-2">
            <span
              className={cn(
                'flex items-center gap-1 text-xs font-bold italic',
                message.label === 'Excellent' || message.label === 'Great'
                  ? 'text-emerald-500'
                  : message.label === 'Good'
                  ? 'text-green-600'
                  : message.label === 'OK'
                  ? 'text-amber-500'
                  : 'text-red-400',
              )}
            >
              <MdRecordVoiceOver /> {message.label}!
            </span>

            {message.improvedResponse && (
              <ImprovementTooltip
                improvedResponse={message.improvedResponse}
                originalText={message.content}
                corrections={message.corrections}
                speakPhrase={speakPhrase}
              />
            )}
          </div>
        )}

        {isUser && (
          <span className="absolute -bottom-1 right-2 h-2 w-2 animate-ping rounded-full bg-blue-400"></span>
        )}
      </div>

      {isUser && (
        <Avatar className="ml-3 h-10 w-10 drop-shadow-md">
          {userAvatarUrl && <AvatarImage src={userAvatarUrl} />}
          <AvatarFallback className="bg-gray-500 text-white">U</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};