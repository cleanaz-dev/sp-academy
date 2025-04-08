// components/account/SharingSettingsForm.tsx
"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateAccountSettings } from "@/lib/actions";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function SharingSettingsForm({ initialSettings, userId }) {
  const [settings, setSettings] = useState(initialSettings);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateAccountSettings(settings);
      router.refresh();
    } catch (error) {
      console.error("Failed to update settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Sharing Preferences</h2>
        <p className="text-muted-foreground">
          Control what activity you share with other users
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label>Reading Logs</Label>
              <p className="text-sm text-muted-foreground">
                Share your reading activity and progress
              </p>
            </div>
            <Switch
              checked={settings.shareReadingLogs}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, shareReadingLogs: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label>Conversations</Label>
              <p className="text-sm text-muted-foreground">
                Share your AI conversation history
              </p>
            </div>
            <Switch
              checked={settings.shareConversationActivity}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, shareConversationActivity: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label>Achievements</Label>
              <p className="text-sm text-muted-foreground">
                Display unlocked achievements on your profile
              </p>
            </div>
            <Switch
              checked={settings.shareAchievements}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, shareAchievements: checked })
              }
            />
          </div>
        </div>
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Sharing Settings"}
      </Button>
    </form>
  );
}
