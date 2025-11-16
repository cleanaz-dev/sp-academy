// app/(dashboard)/achievements/create/page.jsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/old-ui/card";
import { Button } from "@/components/old-ui/button";
import { Input } from "@/components/old-ui/input";
import { Textarea } from "@/components/old-ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/old-ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Label } from "@/components/old-ui/label";

export default function CreateAchievement() {
  const [categories, setCategories] = useState([]);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingBadges, setLoadingBadges] = useState(false);
  const [generatedBadges, setGeneratedBadges] = useState([]);
  const [selectedBadge, setSelectedBadge] = useState("");
  const [previewBadge, setPreviewBadge] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: {
      id: "",
      name: "",
    },
    imageUrl: "",
    criteria: {
      type: "count",
      target: 1,
      metric: "",
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/achievements");
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (generatedBadges.length > 0 && !selectedBadge) {
      toast.error("Please select a badge");
      setLoading(false);
      return;
    }

    try {
      const awsUploadUrl = await fetch(
        "/api/achievements/upload-achievement-badge",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imageUrl: selectedBadge }),
        },
      );

      if (!awsUploadUrl.ok) {
        throw new Error("Failed to upload image");
      }
      const awsUploadUrlData = await awsUploadUrl.json();

      // Send the form data with the correct structure
      const response = await fetch("/api/achievements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          category: formData.category, // This includes both id and name
          imageUrl: awsUploadUrlData.imageUrl,
          criteria: formData.criteria,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create achievement");
      }

      toast.success("Achievement created successfully");
      router.push("/achievements");
      router.refresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBadges = async (e) => {
    e.preventDefault();
    setLoadingBadges(true);

    try {
      const response = await fetch(
        "/api/achievements/generate-achievement-badge",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ formData }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate achievement badges");
      }

      setGeneratedBadges(data.achievementBadges);
      toast.success("Achievement badges generated successfully");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingBadges(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <header className="mb-2">
        <h1 className="header-title">Create Achievement 🏆🥇🎯🔓</h1>
        <p className="text-sm text-muted-foreground">
          Use this form to create a new achievement.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Create New Achievement</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="font-semibold">Name</Label>
              <Input
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Achievement name"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Achievement description"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Category</Label>
              <Select
                required
                value={formData.category.id}
                onValueChange={(value) => {
                  const selectedCategory = categories.find(
                    (category) => category.id === value,
                  );
                  setFormData({
                    ...formData,
                    category: {
                      id: value,
                      name: selectedCategory ? selectedCategory.name : "",
                    },
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label className="font-semibold">Achievement Criteria</Label>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target Number</Label>
                  <Input
                    type="number"
                    required
                    value={formData.criteria.target}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        criteria: {
                          ...formData.criteria,
                          target: parseInt(e.target.value),
                        },
                      })
                    }
                    placeholder="Target number"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Metric</label>
                  <Input
                    required
                    value={formData.criteria.metric}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        criteria: {
                          ...formData.criteria,
                          metric: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g., books read, words learned"
                  />
                </div>
              </div>
            </div>

            {loadingBadges && (
              <div className="flex justify-center p-4">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              </div>
            )}

            {generatedBadges.length > 0 && (
              <p className="mb-2 text-sm text-muted-foreground">
                {generatedBadges.length} badges generated. Click to select one.
              </p>
            )}

            {generatedBadges.length > 0 && (
              <div className="space-y-4">
                <Label className="font-semibold">Select Badge</Label>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {generatedBadges.map((badgeUrl, index) => (
                    <div
                      key={index}
                      className={`relative cursor-pointer rounded-lg border-2 p-2 hover:border-primary ${
                        selectedBadge === badgeUrl
                          ? "border-primary"
                          : "border-transparent"
                      }`}
                      onClick={() => {
                        setSelectedBadge(badgeUrl);
                        setFormData({ ...formData, imageUrl: badgeUrl });
                      }}
                    >
                      <img
                        src={badgeUrl}
                        alt={`Badge option ${index + 1}`}
                        className="h-auto w-full rounded"
                      />
                      {selectedBadge === badgeUrl && (
                        <div className="absolute right-2 top-2 rounded-full bg-primary p-1 text-white">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleGenerateBadges}>
                {!loadingBadges ? (
                  "Generate Badges 🎨🖼️🖌️"
                ) : (
                  <span className="text-gray-400">Generating badges...</span>
                )}
              </Button>

              <Button type="submit" disabled={loading || !generatedBadges}>
                {loading ? "Creating..." : "Create Achievement"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
