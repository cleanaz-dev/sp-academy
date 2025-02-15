// components/account/ProfilePictureUploader.tsx
"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateAccountSettings } from "@/lib/actions";
import { toast } from "sonner";
import { Loader2, Wand2 } from "lucide-react";

export function ProfilePictureUploader({ initialImageUrl, userId }) {
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [avatarDescription, setAvatarDescription] = useState("");

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
    if (!avatarDescription.trim()) {
      toast.error("Please enter a description for your avatar.");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate/avatar-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: avatarDescription }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to generate avatar");

      setImageUrl(data.imageUrl);
      toast.success("Avatar generated successfully!");
    } catch (error) {
      console.error("Avatar generation error:", error);
      toast.error("Failed to generate avatar. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Label>Profile Picture</Label>
      <div className="flex flex-col md:flex-row items-start gap-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={imageUrl} />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <input
              type="file"
              id="profile-picture"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Label htmlFor="profile-picture" className="cursor-pointer">
              <Button variant="outline" disabled={isLoading}>
                {isLoading ? "Uploading..." : "Upload Photo"}
              </Button>
            </Label>
            <p className="text-sm text-muted-foreground">
              Recommended size: 400x400px
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <Label>Generate AI Avatar</Label>
            <Textarea
              placeholder="Describe your avatar (e.g., 'A futuristic robot with glowing blue eyes')"
              value={avatarDescription}
              onChange={(e) => setAvatarDescription(e.target.value)}
              className="min-h-[100px]"
            />
            <Button
              onClick={handleGenerateAvatar}
              disabled={isGenerating}
              className="w-full md:w-auto"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4 mr-2" />
              )}
              Generate Avatar
            </Button>
          </div>
        </div>
      </div>

      {imageUrl && (
        <div className="flex justify-end">
          <Button
            onClick={async () => {
              setIsLoading(true);
              try {
                await updateAccountSettings({ avatarUrl: imageUrl });
                toast.success("Profile picture saved successfully!");
              } catch (error) {
                console.error("Failed to save image:", error);
                toast.error("Failed to save image. Please try again.");
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Profile Picture"}
          </Button>
        </div>
      )}
    </div>
  );
}