import React from "react";
import { getAchievementsByUserId } from "@/lib/actions";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { Lock, Unlock } from "lucide-react";

export default async function AchievementsPage() {
  const { userId } = auth();
  const userAchievements = await getAchievementsByUserId(userId);

  return (
    <main className="bg-gray-50 min-h-screen py-8">
      <header className="text-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">Achievements</h1>
        <p className="text-gray-600 text-sm">Your progress, one step at a time.</p>
      </header>

      <section className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {userAchievements.map(({ achievement, isUnlocked }) => (
            <div 
              key={achievement.id} 
              className="relative flex flex-col items-center text-center space-y-2 p-3"
            >
              {/* Achievement Image */}
              <div className="relative">
                <Image
                  src={achievement.imageUrl}
                  alt={achievement.name}
                  width={80}
                  height={80}
                  className={`rounded-full shadow-sm transition ${
                    isUnlocked ? "grayscale-0" : "grayscale opacity-50"
                  }`}
                  priority
                />
                
                {/* Lock Overlay for Locked Achievements */}
                {!isUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                    <Lock className="text-white w-6 h-6" />
                  </div>
                )}
              </div>

              {/* Name */}
              <p className="text-sm font-medium text-gray-800">{achievement.name}</p>

              {/* Unlock Status */}
              <div className="flex items-center space-x-1 text-xs">
                {isUnlocked ? (
                  <>
                    <Unlock className="text-green-600 w-4 h-4" />
                    <p className="text-green-600 font-medium">Unlocked! 🎉</p>
                  </>
                ) : (
                  <>
                    <Lock className="text-gray-500 w-4 h-4" />
                    <p className="text-gray-500 font-medium">Still locked... Keep going! 🔥</p>
                  </>
                )}
              </div>

              {/* Description */}
              {achievement.description && (
                <p className="text-xs text-gray-600">{achievement.description}</p>
              )}

              {/* Category */}
              <span className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded-md">
                {achievement.category.name}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
