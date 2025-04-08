"use client";

import { Badge } from "../ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function AchievementCard({ achievements }) {
  const { user } = useUser();
  const [isChecking, setIsChecking] = useState(false);

  const checkAchievements = async () => {
    if (!user) return;

    try {
      setIsChecking(true);
      const response = await fetch("/api/achievements/check-achievements/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // You could pass user-specific data if needed
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Optionally refresh the achievements list
        // You might want to pass a refresh function from the parent
        // or use SWR/React Query for data management
        window.location.reload(); // Simple refresh for now
      }
    } catch (error) {
      console.error("Failed to check achievements:", error);
    } finally {
      setIsChecking(false);
    }
  };
  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader className="border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            <span className="flex items-center gap-4">
              <p>Achievements</p>
              <Link href={`/achievements/`}>
                <Button variant="link" size="sm">
                  View All
                </Button>
              </Link>
            </span>
          </CardTitle>
          <Button
            onClick={checkAchievements}
            disabled={isChecking}
            variant="outline"
            size="sm"
          >
            {isChecking ? "Checking..." : "Check Achievements"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <ScrollArea className="h-72">
          <div className="grid grid-cols-1 gap-4">
            {achievements
              .sort((a, b) => {
                if (a.isUnlocked !== b.isUnlocked) {
                  return b.isUnlocked - a.isUnlocked; // Unlocked first
                }
                return b.progress - a.progress; // Then sort by progress
              })
              .map(({ achievement, isUnlocked, progress, id }) => (
                <div
                  key={id}
                  className="rounded-lg border border-gray-100 bg-white p-4 transition-all duration-300 hover:shadow-md"
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`rounded-lg p-3 ${
                        isUnlocked ? "bg-green-100" : "bg-gray-100"
                      }`}
                    >
                      <img
                        src={achievement.imageUrl}
                        alt={achievement.name}
                        className={`h-10 w-10 object-cover ${
                          !isUnlocked && "opacity-50 grayscale"
                        } transition-all duration-300`}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="truncate text-sm font-semibold text-gray-900">
                          {achievement.name}
                        </h3>
                        {isUnlocked ? (
                          <Badge className="inline-block rounded-full bg-green-500 px-2 py-0.5 text-white">
                            Unlocked
                          </Badge>
                        ) : (
                          <Badge className="inline-block rounded-full bg-gray-500/30 px-2 py-0.5 text-white">
                            Locked
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500">
                        {achievement.criteria.metric}
                      </p>

                      {!isUnlocked && (
                        <div className="mt-3">
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-xs text-gray-600">
                              Progress
                            </span>
                            <span className="text-xs font-medium text-gray-600">
                              {Math.round(
                                (progress.current / progress.target) * 100,
                              )}
                              %
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-gray-200">
                            <div
                              className="h-full rounded-full bg-blue-500 transition-all duration-300"
                              style={{
                                width: `${Math.round(
                                  (progress.current / progress.target) * 100,
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
