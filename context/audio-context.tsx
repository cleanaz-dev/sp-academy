'use client'; // needed for Next.js App Router; harmless elsewhere

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

/* -------------------------------------------------------------------------- */
/* 1. Context + Provider  (put in audio-context.tsx)                          */
/* -------------------------------------------------------------------------- */

interface AudioContextType {
  currentTrack: string | null;
  isPlaying: boolean;
  playTrack: (url: string) => void;
  pause: () => void;
  togglePlay: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // One HTMLAudioElement for the whole app lifetime
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Mirror of currentTrack so callbacks stay stable and never read stale state
  const currentTrackRef = useRef<string | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false); // don't rely on 'pause' firing at the end

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  const playTrack = useCallback((url: string) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentTrackRef.current !== url) {
      audio.src = url;
      currentTrackRef.current = url;
      setCurrentTrack(url);
    }
    audio.play().catch((err) => {
      // AbortError happens when a new track interrupts a pending play(); safe to ignore
      if (err?.name !== 'AbortError') console.error('Playback failed:', err);
    });
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrackRef.current) return;

    if (audio.paused) {
      audio.play().catch((err) => console.error('Playback failed:', err));
    } else {
      audio.pause();
    }
  }, []);

  // Memoized so consumers only re-render when something actually changes
  const value = useMemo(
    () => ({ currentTrack, isPlaying, playTrack, pause, togglePlay }),
    [currentTrack, isPlaying, playTrack, pause, togglePlay]
  );

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used within an AudioProvider');
  return context;
};

