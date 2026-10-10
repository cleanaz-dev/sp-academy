"use client";
import React, { useState, useRef, useEffect } from "react";
import { ArrowRight, Play, Square, Loader2 } from "lucide-react";
import { useS3Media } from "@/context/s3-context";
import { useWordAudio } from "@/context/word-audio-context";
import { getPresignedUrls } from "@/app/actions/s3";

export function BridgeSceneStep({ data, onNext }: { data: any; onNext: () => void }) {
  const { stopAudio } = useWordAudio();

  const audioKey: string | undefined =
    data.npcAudioS3Key ||
    data.npcAudio ||
    data.bridgeAssets?.npcAudioS3Key ||
    undefined;

  const { urls } = useS3Media([data.imageS3Key || ""]);
  const imageUrl = urls?.[0] || undefined;

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const toggleAudio = async () => {
    if (isPlayingAudio) {
      audioRef.current?.pause();
      setIsPlayingAudio(false);
      return;
    }

    setAudioError(null);

    if (!audioKey) {
      setAudioError(
        `No audio key on this bridge. Fields I can see: ${Object.keys(data).join(", ")}`
      );
      return;
    }

    setIsFetching(true);
    let url = "";
    try {
      const res = await getPresignedUrls([audioKey]);
      url = res[audioKey] || "";
    } catch (e: any) {
      setAudioError(`Signing threw: ${e?.message ?? e}`);
      setIsFetching(false);
      return;
    }
    setIsFetching(false);

    if (!url) {
      setAudioError(`Could not sign URL for: ${audioKey}`);
      return;
    }

    stopAudio();
    audioRef.current?.pause();

    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onended = () => setIsPlayingAudio(false);
    audio.onerror = () => {
      setAudioError(`Audio failed to load (code ${audio.error?.code}). Open this in a tab: ${url}`);
      setIsPlayingAudio(false);
    };
    try {
      await audio.play();
      setIsPlayingAudio(true);
    } catch (e: any) {
      setAudioError(`Playback blocked: ${e?.message ?? e}`);
      setIsPlayingAudio(false);
    }
  };

  const handleNext = () => {
    audioRef.current?.pause();
    onNext();
  };

  return (
    <div className="flex h-full flex-col p-8 md:p-12 animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="mb-3 text-3xl font-extrabold text-gray-900 md:text-4xl">Scene Context</h2>
        <p className="text-lg text-gray-500">Listen to the scenario before practicing.</p>
      </div>

      <div className="relative mb-12 flex h-72 w-full items-center justify-center overflow-hidden rounded-2xl bg-gray-900 shadow-inner md:h-96">
        {imageUrl ? (
          <img src={imageUrl} alt={data.altText ?? ""} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full animate-pulse bg-gray-800" />
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-6">
          <div className="mx-auto flex max-w-2xl items-center gap-4 rounded-2xl bg-white/95 px-6 py-5 shadow-xl backdrop-blur-md">
            <button
              onClick={toggleAudio}
              disabled={isFetching}
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-sm transition-all disabled:opacity-40 ${
                isPlayingAudio ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-600"
              }`}
            >
              {isFetching ? (
                <Loader2 size={20} className="animate-spin" />
              ) : isPlayingAudio ? (
                <Square size={20} className="fill-current" />
              ) : (
                <Play size={20} className="ml-1 fill-current" />
              )}
            </button>
            <div className="flex-1">
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-gray-500">NPC Says:</p>
              <p className="text-lg font-medium text-gray-900">"{data.npcLine}"</p>
              {audioError && (
                <p className="mt-2 break-all text-xs font-medium text-red-600">{audioError}</p>
              )}
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