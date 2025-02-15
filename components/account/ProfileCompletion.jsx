// components/account/ProfileCompletion.tsx
"use client";

import { Progress } from "@/components/ui/progress";

export function ProfileCompletion({ completionPercentage }) {
  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold">Profile Completion</h2>
      <div className="flex items-center gap-4">
        <Progress value={completionPercentage} className="h-2" />
        <span className="text-sm text-muted-foreground">
          {completionPercentage}%
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        Complete your profile to unlock all features.
      </p>
    </div>
  );
}