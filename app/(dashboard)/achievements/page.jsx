import React from "react";
import { getAchievementsByUserId } from "@/lib/actions";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { Lock, Unlock } from "lucide-react";

export default async function AchievementsPage() {
  const { userId } = auth();
  const userAchievements = await getAchievementsByUserId(userId);

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-semibold text-gray-800">Achievements</h1>
        <p className="text-sm text-gray-600">
          Your progress, one step at a time.
        </p>
      </header>

      <section className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {userAchievements.map(({ achievement, isUnlocked }) => (
            <div
              key={achievement.id}
              className="relative flex flex-col items-center space-y-2 p-3 text-center"
            >
              {/* Achievement Image */}
              <div className="relative">
                <Image
                  src={achievement.imageUrl}
                  alt={achievement.name}
                  width={80}
                  height={80}
                  className={`rounded-full shadow-sm transition ${
                    isUnlocked ? "grayscale-0" : "opacity-50 grayscale"
                  }`}
                  priority
                />

                {/* Lock Overlay for Locked Achievements */}
                {!isUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                    <Lock className="h-6 w-6 text-white" />
                  </div>
                )}
              </div>

              {/* Name */}
              <p className="text-sm font-medium text-gray-800">
                {achievement.name}
              </p>

              {/* Unlock Status */}
              <div className="flex items-center space-x-1 text-xs">
                {isUnlocked ? (
                  <>
                    <Unlock className="h-4 w-4 text-green-600" />
                    <p className="font-medium text-green-600">Unlocked! 🎉</p>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 text-gray-500" />
                    <p className="font-medium text-gray-500">
                      Still locked... Keep going! 🔥
                    </p>
                  </>
                )}
              </div>

              {/* Description */}
              {achievement.description && (
                <p className="text-xs text-gray-600">
                  {achievement.description}
                </p>
              )}

              {/* Category */}
              <span
                className={`text-xs text-gray-700 ${isUnlocked ? "bg-green-400" : "bg-gray-100"} rounded-md px-2 py-1`}
              >
                {achievement.category.name}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
