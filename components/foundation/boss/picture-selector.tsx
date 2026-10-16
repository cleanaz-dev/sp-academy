"use client";

import type { ImageOption } from "@/context/boss-context";

interface PictureSelectorProps {
  options: ImageOption[];
  resolveAssetUrl: (key: string) => string;
  onSubmit: (answer: string) => void;
  playWord?: (phrase: string, gender?: "m" | "f") => Promise<void>;
  stopWordAudio?: () => void;
}

export function PictureSelector({
  options,
  resolveAssetUrl,
  onSubmit,
  playWord,
  stopWordAudio,
}: PictureSelectorProps) {
  const handleClick = (label: string) => {
    stopWordAudio?.();
    playWord?.(label, "m");
    onSubmit(label);
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {options.map((option, index) => (
        <button
          key={`${option.label}-${index}`}
          type="button"
          onClick={() => handleClick(option.label)}
          className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-slate-200 bg-white text-left transition-all hover:border-indigo-500 hover:shadow-md active:scale-95"
        >
          <div className="aspect-square w-full overflow-hidden bg-slate-100">
            <img
              src={resolveAssetUrl(option.imageKey)}
              alt={option.label}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          <div className="border-t-2 border-slate-100 p-3 text-center">
            <span className="text-[15px] font-extrabold text-slate-700 transition-colors group-hover:text-indigo-600">
              {option.label}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}