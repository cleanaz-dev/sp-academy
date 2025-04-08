// components/account/SaveIndicator.tsx
"use client";

import { CheckCircle, Loader2 } from "lucide-react";

export function SaveIndicator({ isSaving, lastSaved }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {isSaving ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Saving...</span>
        </>
      ) : (
        <>
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>Last saved: {lastSaved}</span>
        </>
      )}
    </div>
  );
}
