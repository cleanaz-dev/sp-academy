import DashboardLessonsPage from "@/components/lessons/DashboardLessonsPage";
import { GraduationCap } from "lucide-react";
import React from "react";

export default function LessonsPage() {
  return (
    <div>
      <header className="bg-gradient-to-r from-sky-400 via-emerald-400 to-violet-400 bg-[length:300%_300%] animate-[gradient_6s_ease_infinite] text-white py-16 mb-8">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="flex items-center gap-4 text-4xl font-bold mb-4">
            Lessons{" "}
            <GraduationCap
              strokeWidth={1.5}
              className="size-10 drop-shadow-xl"
            />
          </h1>
          <p className="text-xl opacity-90">
            Enhance your knowledge with our comprehensive lessons. Discover new
            topics and build a strong foundation for success!
          </p>
        </div>
      </header>
      <DashboardLessonsPage />
    </div>
  );
}
