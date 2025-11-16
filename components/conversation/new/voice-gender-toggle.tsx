import React from 'react';
import { Switch } from '@/components/ui/switch';
import type { VoiceGender } from './types';

interface Props {
  voiceGender: VoiceGender;
  onToggle: () => void;
}

export const VoiceGenderToggle: React.FC<Props> = ({
  voiceGender,
  onToggle,
}) => (
  <div className="flex items-center space-x-2">
    <span className="text-sm font-medium text-gray-700">Voice:</span>
    <Switch
      checked={voiceGender === 'male'}
      onCheckedChange={onToggle}
    >
      <span
        className={`${
          voiceGender === 'male' ? 'translate-x-6' : 'translate-x-1'
        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
      />
    </Switch>
    <span className="text-2xl">{voiceGender === 'male' ? '🚹' : '🚺'}</span>
  </div>
);