"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateAccountSettings } from "@/lib/actions";
import { Switch } from "../ui/switch";

export function AccountSettingsForm({ initialSettings, userId }) {
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
    <main>
      <h1 className="font-semibold text-2xl mb-2">General Information</h1>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-6 md:grid-cols-2"
      >
        <input type="hidden" name="userId" value={userId} />
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Select
            value={settings.language}
            onValueChange={(value) =>
              setSettings({ ...settings, language: value })
            }
          >
            <SelectTrigger id="language">
              <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ENGLISH">English</SelectItem>
              <SelectItem value="SPANISH">Spanish</SelectItem>
              <SelectItem value="FRENCH">French</SelectItem>
              {/* Add more language options as needed */}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Display Name</Label>
          <Input
            type="text"
            name="displayName"
            value={settings.displayName || ""}
            onChange={(e) =>
              setSettings({ ...settings, displayName: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="aiVoicePreference">AI Voice Preference</Label>
          <Select
            value={settings.aiVoicePreference} // Default to female
            onValueChange={(value) =>
              setSettings({ ...settings, aiVoicePreference: value })
            }
          >
            <SelectTrigger id="aiVoicePreference">
              <SelectValue placeholder="Select a voice" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MALE">Male</SelectItem>
              <SelectItem value="FEMALE">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="level">Level</Label>
          <Select
            value={settings.level}
            onValueChange={(value) =>
              setSettings({ ...settings, level: value })
            }
          >
            <SelectTrigger id="level">
              <SelectValue placeholder="Select a subscription plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BEGINNER">Beginner</SelectItem>
              <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
              <SelectItem value="ADVANCED">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="emailNotifications">Email Notifications</Label>
          <p className="text-sm text-muted-foreground">
            Select which email updates you'd like to receive.
          </p>
          <div className="flex justify-between pt-2">
            <div className="flex gap-2 items-center">
              <Switch
                id="dailyEmails"
                checked={settings.dailyEmails}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    dailyEmails: checked,
                  })
                }
              />
              <p className="text-sm">Daily Emails</p>
            </div>
            <div className="flex gap-2 items-center">
              <Switch
                id="weeklyEmails"
                checked={settings.weeklyEmails}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    weeklyEmails: checked,
                  })
                }
              />
              <p className="text-sm">Weekly Emails</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sharingSettings">Sharing Preferences</Label>
          <p className="text-sm text-muted-foreground">
            Choose what activity you'd like to share with other users.
          </p>
          <div className="flex justify-between pt-2">
            <div className="flex gap-2 items-center">
              <Switch
                id="readingLogs"
                checked={settings.shareReadingLogs}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    shareReadingLogs: checked, // Fixed incorrect key
                  })
                }
              />
              <p className="text-sm">Reading Logs</p>
            </div>
            <div className="flex gap-2 items-center">
              <Switch
                id="conversationsActivity"
                checked={settings.shareConversationActivity}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    shareConversationActivity: checked, // Fixed incorrect key
                  })
                }
              />
              <p className="text-sm">Conversations</p>
            </div>
            <div className="flex gap-2 items-center">
              <Switch
                id="conversationsActivity"
                checked={settings.shareAchievements}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    shareAchievements: checked, // Fixed incorrect key
                  })
                }
              />
              <p className="text-sm">Achievements</p>
            </div>
          </div>
        </div>

        <div className="flex w-full">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Account Changes"}
          </Button>
        </div>
      </form>
    </main>
  );
}

AccountSettingsForm.propTypes = {
  initialSettings: PropTypes.shape({
    language: PropTypes.string.isRequired,
    displayName: PropTypes.string,
    avatarUrl: PropTypes.string,
    billingPlan: PropTypes.string,
    aiVoicePreference: PropTypes.string,
    level: PropTypes.string,
  }).isRequired,
  userId: PropTypes.string.isRequired,
};
