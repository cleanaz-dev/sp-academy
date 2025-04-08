import EnhancedDialogueGenerator from "@/components/conversation/EnhancedDialogueGenerator";
import { BotMessageSquare } from "lucide-react";
import React from "react";

export default function page() {
  return (
    <div>
      <header className="mb-8 animate-[gradient_6s_ease_infinite] bg-gradient-to-r from-sky-400 via-emerald-400 to-violet-400 bg-[length:300%_300%] py-16 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="mb-4 flex items-center gap-4 text-4xl font-bold">
            Converastion Generator{" "}
            <BotMessageSquare
              strokeWidth={1.5}
              className="size-10 drop-shadow-xl"
            />
          </h1>
          <p className="text-xl opacity-90">
            Generate dynamic conversations tailored to your learning needs.
            Engage with AI-driven dialogue and enhance your language skills
            effortlessly!
          </p>
        </div>
      </header>
      <EnhancedDialogueGenerator />
    </div>
  );
}
