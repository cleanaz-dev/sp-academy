// components/account/ProfilePictureUploader.tsx
"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateAccountSettings } from "@/lib/actions";
import { toast } from "sonner";
import { Loader2, Upload, Wand2, Sparkles, User, Save } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { motion, AnimatePresence } from "framer-motion";

export function ProfilePictureUploader({ initialImageUrl, userId }) {
  const [generationsRemaining, setGenerationsRemaining] = useState(5);
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [avatarDescription, setAvatarDescription] = useState("");
  const [aiImageUrl, setAiImageUrl] = useState(null);
  const [showCreateAvatar, setShowCreateAvatar] = useState(false);
  const [avatarType, setAvatarType] = useState("realistic");
  const [avatarStyle, setAvatarStyle] = useState("default");

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload-profile-picture", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setImageUrl(data.url);
      await updateAccountSettings({ avatarUrl: data.url });
      toast.success("Profile picture updated successfully!");
    } catch (error) {
      console.error("Failed to upload image:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAvatar = async () => {
    if (generationsRemaining <= 0) {
      toast.error("You've reached your monthly generation limit.");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate/avatar-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: avatarDescription,
          type: avatarType,
          style: avatarStyle,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to generate avatar");

      setImageUrl(data.imageUrl);
      setAiImageUrl(data.imageUrl);
      setGenerationsRemaining((prev) => prev - 1);
      toast.success("Avatar generated successfully!");
    } catch (error) {
      console.error("Avatar generation error:", error);
      toast.error("Failed to generate avatar. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/generate/avatar-image/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiImageUrl }), // Send aiImageUrl
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to save AI avatar");
      toast.success("AI avatar saved successfully!");
    } catch (error) {
      console.error("Failed to save AI avatar:", error);
      toast.error("Failed to save AI avatar. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <Label className="text-lg font-semibold">Profile Picture</Label>
        <p className="text-sm text-muted-foreground">
          Upload a photo or generate an AI avatar (5 generations remaining this
          month)
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Left Column: Avatar Upload */}
        <div className="space-y-4 p-6">
          <div className="space-y-4">
            <div className="relative flex aspect-square w-full items-center justify-center rounded-lg bg-background">
              {/* Centered text on top */}
              <Label className="absolute left-1/2 top-2 -translate-x-1/2 transform text-sm font-medium">
                Current Picture
              </Label>

              {imageUrl ? (
                <div className="size-36">
                  <img
                    src={imageUrl}
                    alt="Profile Preview"
                    className="h-full w-full rounded-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex size-36 items-center rounded-full border bg-gray-50">
                  <User className="mx-auto h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <input
                type="file"
                id="profile-picture"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Label
                htmlFor="profile-picture"
                className="w-full cursor-pointer"
              >
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Upload Photo
                </Button>
              </Label>
              <p className="text-center text-xs text-muted-foreground">
                Recommended: 400×400px, JPG or PNG
              </p>
            </div>
          </div>
        </div>

        {/* Middle Column: AI Generation */}
        <div className="col-span-2 flex flex-col gap-4 rounded-2xl border md:flex-row">
          {/* Left Column: AI Avatar Creation */}
          <div className="flex-1 space-y-4 p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-medium">Create AI Avatar</Label>

                {/* Type Selection */}
                <div className="flex items-center gap-4">
                  <h1 className="w-[30px] text-sm font-bold">Type:</h1>
                  <Select value={avatarType} onValueChange={setAvatarType}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select an image type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Image Type:</SelectLabel>
                        <SelectItem value="realistic_image">
                          Realistic
                        </SelectItem>
                        <SelectItem value="digital_illustration">
                          Illustration
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* Style Selection */}
                <div className="flex items-center gap-4">
                  <h1 className="w-[30px] text-sm font-bold">Style:</h1>
                  <Select value={avatarStyle} onValueChange={setAvatarStyle}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select a style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Style:</SelectLabel>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="neon">Neon</SelectItem>
                        <SelectItem value="cyberpunk">Cyberpunk</SelectItem>
                        <SelectItem value="low-poly">Low-Poly</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* Avatar Description */}
                <Textarea
                  placeholder="Describe your ideal avatar..."
                  value={avatarDescription}
                  onChange={(e) => setAvatarDescription(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              {/* Generate Button */}
              <div className="space-y-3">
                <Button
                  onClick={handleGenerateAvatar}
                  disabled={isGenerating || generationsRemaining <= 0}
                  className="w-full"
                >
                  {isGenerating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                  )}
                  Generate Avatar
                </Button>

                {/* Generations Left Indicator */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Generations left:
                    <span className="ml-1 font-medium text-foreground">
                      {generationsRemaining}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: AI Preview */}
          <div className="flex-1 p-6">
            <div className="flex flex-col items-center px-4">
              {/* Centered AI Preview Text */}

              {/* AI Image Preview */}
              <div className="relative flex aspect-square w-full items-center justify-center">
                {aiImageUrl ? (
                  <div className="size-36 rounded-lg border bg-gray-50">
                    <img
                      src={aiImageUrl}
                      alt="AI Avatar Preview"
                      className="h-full w-full rounded-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex size-36 items-center rounded-full border bg-gray-50">
                    <User className="mx-auto h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Section */}
      {(imageUrl || aiImageUrl) && (
        <div className="flex justify-end border-t pt-4">
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Profile Picture
          </Button>
        </div>
      )}
    </div>
  );
}
