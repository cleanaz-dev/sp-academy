"use client"

import { useAudio } from "@/context/audio-context";

export function TrackItem({ trackUrl, title }: { trackUrl: string; title: string }) {
  const { playTrack, togglePlay, currentTrack, isPlaying } = useAudio();
  const isCurrent = currentTrack === trackUrl;

  return (
    <div className="track">
      <p>{title}</p>
      {/* Clicking the active track toggles; clicking another starts it */}
      <button onClick={() => (isCurrent ? togglePlay() : playTrack(trackUrl))}>
        {isCurrent && isPlaying ? 'Pause' : 'Play'}
      </button>
    </div>
  );
}