"use client"

import { useAudio } from "@/context/audio-context";

export default function GlobalPlayerBar() {
  const { currentTrack, isPlaying, togglePlay } = useAudio();

  if (!currentTrack) return null;

  return (
    <div className="fixed-bottom-bar">
      <span>Now Playing: {currentTrack}</span>
      <button onClick={togglePlay}>{isPlaying ? '⏸️ Pause' : '▶️ Play'}</button>
    </div>
  );
}