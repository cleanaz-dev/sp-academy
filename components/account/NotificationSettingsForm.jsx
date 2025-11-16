// components/account/NotificationSettingsForm.tsx
"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateAccountSettings } from "@/lib/actions";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function NotificationSettingsForm({ initialSettings, userId }) {
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
        <h2 className="text-xl font-semibold">Notification Preferences</h2>
        <p className="text-muted-foreground">
          Manage how we communicate with you
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive important account notifications via email
              </p>
            </div>
            <Switch
              checked={settings.dailyEmails}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, dailyEmails: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label>Weekly Digest</Label>
              <p className="text-sm text-muted-foreground">
                Get a weekly summary of your activity
              </p>
            </div>
            <Switch
              checked={settings.weeklyEmails}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, weeklyEmails: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label>Promotional Offers</Label>
              <p className="text-sm text-muted-foreground">
                Receive special offers and updates
              </p>
            </div>
            <Switch
              checked={settings.promotionEmails}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, promotionEmails: checked })
              }
            />
          </div>
        </div>
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Notification Settings"}
      </Button>
    </form>
  );
}
