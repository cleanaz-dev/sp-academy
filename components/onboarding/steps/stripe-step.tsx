"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Play, Square, Volume2 } from "lucide-react";
import {
  SPRITES,
  SPRITE_VOICES,
  type SpriteSlug,
  type VoiceOption,
} from "../constants";
import { SelectionCard } from "../selection-card";

interface SpriteStepProps {
  targetLanguage: string;
  selectedSprite: SpriteSlug;
  setSelectedSprite: (slug: SpriteSlug) => void;
  selectedVoiceId: string;
  setSelectedVoiceId: (id: string) => void;
}

export function SpriteStep({
  targetLanguage,
  selectedSprite,
  setSelectedSprite,
  selectedVoiceId,
  setSelectedVoiceId,
}: SpriteStepProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const allLocaleVoices =
    SPRITE_VOICES[targetLanguage] ?? SPRITE_VOICES["fr-FR"];
  const voices = allLocaleVoices.filter((v) => v.sprite === selectedSprite);

  // Auto-select first voice when user toggles between Vox and Vivi
  useEffect(() => {
    if (!voices.some((v) => v.id === selectedVoiceId) && voices[0]) {
      setSelectedVoiceId(voices[0].id);
    }
  }, [selectedSprite, targetLanguage, voices, selectedVoiceId, setSelectedVoiceId]);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const handlePlaySample = (voice: VoiceOption, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedVoiceId(voice.id);

    if (playingId === voice.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(voice.sampleUrl);
    audioRef.current = audio;
    audio.onended = () => setPlayingId(null);
    audio.play().catch((err) => {
      console.warn("Sample audio missing locally:", err);
      setPlayingId(null);
    });

    setPlayingId(voice.id);
  };

  return (
    <div className="space-y-8">
      {/* 1. Choose Companion: Vox vs Vivi */}
      <div className="grid gap-4 sm:grid-cols-2">
        {SPRITES.map((s) => {
          const selected = selectedSprite === s.slug;
          return (
            <button
              key={s.slug}
              type="button"
              onClick={() => setSelectedSprite(s.slug)}
              className={`relative flex flex-col items-center rounded-2xl border p-6 text-center transition-all duration-200 ${
                selected
                  ? "border-violet-400 bg-violet-50 shadow-md shadow-violet-500/10"
                  : "border-gray-100 bg-white shadow-xs hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
              }`}
            >
              <div
                className={`absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full transition ${
                  selected
                    ? "bg-violet-600 text-white"
                    : "border-2 border-gray-200"
                }`}
              >
                {selected && <Check className="h-4 w-4 stroke-3" />}
              </div>

              <div className="h-28 w-28 overflow-hidden rounded-2xl bg-gradient-to-b from-violet-100/60 to-white shadow-sm">
                <img
                  src={s.avatarUrl}
                  alt={s.name}
                  className="h-full w-full object-cover object-top"
                />
              </div>

              <h3 className="mt-4 text-xl font-extrabold text-gray-900">
                {s.name}
              </h3>
              <p className="mt-1 text-sm font-medium text-gray-500">
                {s.tagline}
              </p>
            </button>
          );
        })}
      </div>

      {/* 2. Choose Voice for Selected Companion */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-gray-500 uppercase">
            <Volume2 className="h-4 w-4 text-violet-600" />
            Choose {selectedSprite === "vox" ? "Vox's" : "Vivi's"} Voice
          </span>
          <span className="text-xs font-medium text-gray-400">
            Click play to preview
          </span>
        </div>

        <div className="grid gap-3">
          {voices.map((v) => {
            const isPlaying = playingId === v.id;
            return (
              <SelectionCard
                key={v.id}
                selected={selectedVoiceId === v.id}
                onClick={() => setSelectedVoiceId(v.id)}
              >
                {/* Play/Stop Sample Button */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={(e) => handlePlaySample(v, e)}
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition ${
                    isPlaying
                      ? "bg-violet-600 text-white shadow-md shadow-violet-500/30"
                      : "bg-violet-100 text-violet-700 hover:bg-violet-200"
                  }`}
                >
                  {isPlaying ? (
                    <Square className="h-4 w-4 fill-current" />
                  ) : (
                    <Play className="h-4 w-4 fill-current ml-0.5" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900">{v.label}</p>
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-gray-500">
                      {v.id}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm font-medium text-gray-500 italic">
                    &ldquo;{v.sampleText}&rdquo;
                  </p>
                </div>
              </SelectionCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}