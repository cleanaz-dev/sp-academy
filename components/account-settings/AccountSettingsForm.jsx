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

  console.log("Account Settings:", initialSettings);

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-6 md:grid-cols-2 mt-6"
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
        <Label htmlFor="billingPlan">Subscription Plan</Label>
        <Select
          value={settings.billingPlan}
          onValueChange={(value) =>
            setSettings({ ...settings, billingPlan: value })
          }
        >
          <SelectTrigger id="billingPlan">
            <SelectValue placeholder="Select a subscription plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="FREE">Free</SelectItem>
            <SelectItem value="BASIC">Basic</SelectItem>
            <SelectItem value="PREMIUM">Premium</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="avatarUrl">Avatar URL</Label>
        <Input
          type="url"
          name="avatarUrl"
          value={settings.avatarUrl || ""}
          onChange={(e) =>
            setSettings({ ...settings, avatarUrl: e.target.value })
          }
        />
      </div>
      <div className="flex items-end justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

AccountSettingsForm.propTypes = {
  initialSettings: PropTypes.shape({
    language: PropTypes.string.isRequired,
    displayName: PropTypes.string,
    avatarUrl: PropTypes.string,
    billingPlan: PropTypes.string,
    aiVoicePreference: PropTypes.string,
  }).isRequired,
  userId: PropTypes.string.isRequired,
};
