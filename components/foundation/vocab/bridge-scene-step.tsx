"use client";
import React, { useState, useRef, useEffect } from "react";
import { ArrowRight, Play, Square } from "lucide-react";
import { getSceneMediaUrls } from "@/app/actions/get-media";
import { useWordAudio } from "@/context/word-audio-context"; // adjust path

export function BridgeSceneStep({ data, onNext }: { data: any; onNext: () => void }) {
  const { stopAudio } = useWordAudio();
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Turn the S3 keys into playable/loadable URLs
  useEffect(() => {
    let cancelled = false;
    getSceneMediaUrls([data.imageS3Key, data.videoS3Key, data.npcAudioS3Key])
      .then((res) => !cancelled && setUrls(res))
      .catch((err) => console.error("Failed to load scene media:", err));
    return () => {
      cancelled = true;
    };
  }, [data.imageS3Key, data.videoS3Key, data.npcAudioS3Key]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const imageUrl = urls[data.imageS3Key];
  const videoUrl = data.videoS3Key ? urls[data.videoS3Key] : undefined;
  const npcAudioUrl = data.npcAudioS3Key ? urls[data.npcAudioS3Key] : undefined;

  const toggleAudio = () => {
    if (isPlayingAudio) {
      audioRef.current?.pause();
      setIsPlayingAudio(false);
      return;
    }
    if (!npcAudioUrl) return;

    stopAudio(); // stop any word-audio / TTS from the context
    audioRef.current?.pause();

    const audio = new Audio(npcAudioUrl);
    audioRef.current = audio;
    audio.onended = () => setIsPlayingAudio(false);
    audio.onerror = () => setIsPlayingAudio(false);
    audio.play().catch(() => setIsPlayingAudio(false));
    setIsPlayingAudio(true);
  };

  const handleNext = () => {
    audioRef.current?.pause();
    onNext();
  };

  return (
    <div className="flex h-full flex-col p-8 md:p-12 animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="mb-3 text-3xl font-extrabold text-gray-900 md:text-4xl">Scene Context</h2>
        <p className="text-lg text-gray-500">Watch the scenario unfold before practicing.</p>
      </div>

      <div className="relative mb-12 flex h-72 w-full items-center justify-center overflow-hidden rounded-2xl bg-gray-900 shadow-inner md:h-96">
        {videoUrl ? (
          <video src={videoUrl} controls className="h-full w-full object-cover" poster={imageUrl} />
        ) : imageUrl ? (
          <img src={imageUrl} alt={data.altText ?? ""} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full animate-pulse bg-gray-800" />
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-6">
          <div className="mx-auto flex max-w-2xl items-center gap-4 rounded-2xl bg-white/95 px-6 py-5 shadow-xl backdrop-blur-md">
            <button
              onClick={toggleAudio}
              disabled={!npcAudioUrl}
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-sm transition-all disabled:opacity-40 ${
                isPlayingAudio ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-600"
              }`}
            >
              {isPlayingAudio ? (
                <Square size={20} className="fill-current" />
              ) : (
                <Play size={20} className="ml-1 fill-current" />
              )}
            </button>
            <div className="flex-1">
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-gray-500">NPC Says:</p>
              <p className="text-lg font-medium text-gray-900">"{data.npcLine}"</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto flex justify-end border-t border-gray-100 pt-6">
        <button
          onClick={handleNext}
          className="flex items-center gap-2 rounded-xl bg-gray-900 px-8 py-4 text-lg font-bold text-white hover:bg-black active:scale-95"
        >
          Next: Learn Vocab <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}