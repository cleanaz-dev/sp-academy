import { useState, useCallback } from 'react';
import { Volume2, RotateCcw } from 'lucide-react';

interface InlineAudioButtonProps {
  audioBase64: string;
  createAudioUrl: (base64: string) => string;
  size?: 'small' | 'medium';
}

export const InlineAudioButton: React.FC<InlineAudioButtonProps> = ({
  audioBase64,
  createAudioUrl,
  size = 'medium'
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  const handlePlay = useCallback(async () => {
    if (isPlaying) return;

    try {
      setIsPlaying(true);
      
      const url = createAudioUrl(audioBase64);
      const audio = new Audio(url);
      audio.volume = 1.0;
      
      await audio.play();
      setHasPlayed(true);
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      }, { once: true });
      
      audio.addEventListener('error', () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      }, { once: true });
      
    } catch (error) {
      console.error("❌ Audio play failed:", error);
      setIsPlaying(false);
      
      try {
        const retryUrl = createAudioUrl(audioBase64);
        const retryAudio = new Audio(retryUrl);
        await retryAudio.play();
        
        retryAudio.addEventListener('ended', () => {
          URL.revokeObjectURL(retryUrl);
        }, { once: true });
      } catch (retryError) {
        console.error("❌ Retry also failed:", retryError);
      }
    }
  }, [audioBase64, createAudioUrl, isPlaying]);

  const isSmall = size === 'small';
  const iconSize = isSmall ? 14 : 16;
  const Icon = hasPlayed && !isPlaying ? RotateCcw : Volume2;

  return (
    <button
      onClick={handlePlay}
      disabled={isPlaying}
      className="group inline-flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all duration-200 ease-out hover:scale-105 active:scale-95"
      style={{
        background: isPlaying 
          ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(147, 51, 234, 0.15))' 
          : 'rgba(156, 163, 175, 0.08)',
        border: isPlaying 
          ? '1px solid rgba(59, 130, 246, 0.3)' 
          : '1px solid rgba(156, 163, 175, 0.15)',
        cursor: isPlaying ? 'wait' : 'pointer',
        opacity: isPlaying ? 0.9 : 1,
        verticalAlign: 'middle',
        boxShadow: isPlaying 
          ? '0 0 12px rgba(59, 130, 246, 0.2)' 
          : '0 1px 2px rgba(0, 0, 0, 0.05)',
      }}
      aria-label={isPlaying ? "Playing audio" : hasPlayed ? "Replay audio" : "Play audio"}
    >
      <Icon 
        size={iconSize} 
        className={`transition-all duration-200 ${
          isPlaying 
            ? 'text-blue-500 animate-pulse' 
            : 'text-gray-600 group-hover:text-blue-500'
        }`}
        style={{
          animation: isPlaying ? 'pulse 1.5s ease-in-out infinite' : 'none'
        }}
      />
      {isPlaying && (
        <span 
          className="text-xs font-medium text-blue-600 animate-pulse"
          style={{ fontSize: isSmall ? '10px' : '11px' }}
        >
          Playing
        </span>
      )}
      {!isPlaying && hasPlayed && (
        <span 
          className="text-xs font-medium "
          style={{ fontSize: isSmall ? '10px' : '11px' }}
        >
          Replay
        </span>
      )}
    </button>
  );
};
