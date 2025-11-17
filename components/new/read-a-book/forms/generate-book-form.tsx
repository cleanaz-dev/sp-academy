"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import GenerateBookCover from "./generate-book-cover";

interface GenerateBookFormProps {
  onSubmit: (formData: FormData) => void;
  isGenerating?: boolean;
}

export default function GenerateBookForm({
  onSubmit,
  isGenerating = false,
}: GenerateBookFormProps) {
  const [numberOfPages, setNumberOfPages] = useState(5);
  const [difficulty, setDifficulty] = useState("");
  const [genre, setGenre] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [nativeLanguage, setNativeLanguage] = useState("");
  const [contentFocus, setContentFocus] = useState<string[]>([
    "vocabulary",
    "verbs",
    "dialogue",
    "mixed",
  ]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate that selects have values
    if (!difficulty || !genre || !targetLanguage || !nativeLanguage) {
      alert("Please fill in all required fields");
      return;
    }

    // Validate at least one content focus is selected
    if (contentFocus.length === 0) {
      alert("Please select at least one content focus");
      return;
    }

    const formData = new FormData(e.currentTarget);

    // Manually add the select values to FormData
    formData.set("difficulty", difficulty);
    formData.set("genre", genre);
    formData.set("targetLanguage", targetLanguage);
    formData.set("nativeLanguage", nativeLanguage);
    formData.set("contentFocus", JSON.stringify(contentFocus));

    onSubmit(formData);
  };

  const languages = [
    { code: "en", name: "English" },
    { code: "fr", name: "French" },
    { code: "es", name: "Spanish" },
  ];

  const contentFocusOptions = [
    { id: "vocabulary", label: "Vocabulary Building" },
    { id: "verbs", label: "Action Verbs" },
    { id: "dialogue", label: "Dialogue/Conversation" },
    { id: "mixed", label: "Mixed Content" },
  ];

  const handleContentFocusChange = (focusId: string, checked: boolean) => {
    if (checked) {
      setContentFocus([...contentFocus, focusId]);
    } else {
      setContentFocus(contentFocus.filter((id) => id !== focusId));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-[1fr,auto] gap-8">
        <div className="space-y-4">
          {/* Target Language */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Target Language (Learning)</Label>
              <Select
                name="targetLanguage"
                required
                value={targetLanguage}
                onValueChange={setTargetLanguage}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select target language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Native Language */}
            <div className="space-y-2">
              <Label>Native Language (Translation)</Label>
              <Select
                name="nativeLanguage"
                required
                value={nativeLanguage}
                onValueChange={setNativeLanguage}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select native language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Title */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Book Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Anna Likes Ice Cream"
                required
                className="bg-white"
              />
            </div>

            {/* Topic */}

            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                name="topic"
                placeholder="e.g., Ice cream adventure"
                required
                className="bg-white"
              />
            </div>
          </div>

          {/* Main Character */}
          <div className="space-y-2">
            <Label htmlFor="mainCharacter">Main Character</Label>
            <Input
              id="mainCharacter"
              name="mainCharacter"
              placeholder="e.g., Anna, a young girl"
              required
              className="bg-white"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Character Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe the main character's appearance and personality"
              rows={3}
              required
              className="bg-white"
            />
          </div>

          {/* Difficulty Level */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Difficulty Level</Label>
              <Select
                name="difficulty"
                required
                value={difficulty}
                onValueChange={setDifficulty}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner (A1)</SelectItem>
                  <SelectItem value="elementary">Elementary (A2)</SelectItem>
                  <SelectItem value="intermediate">
                    Intermediate (B1)
                  </SelectItem>
                  <SelectItem value="advanced">Advanced (B2+)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Genre */}
            <div className="space-y-2">
              <Label>Genre</Label>
              <Select
                name="genre"
                required
                value={genre}
                onValueChange={setGenre}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adventure">Adventure</SelectItem>
                  <SelectItem value="fantasy">Fantasy</SelectItem>
                  <SelectItem value="mystery">Mystery</SelectItem>
                  <SelectItem value="slice-of-life">Slice of Life</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Content Focus */}
          <div className="space-y-3">
            <Label>Content Focus</Label>
            <div className="space-y-2">
              {contentFocusOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.id}
                    checked={contentFocus.includes(option.id)}
                    onCheckedChange={(checked) =>
                      handleContentFocusChange(option.id, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={option.id}
                    className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Number of Pages */}
          <div className="space-y-2">
            <Label htmlFor="numberOfPages">
              Number of Pages: {numberOfPages}
            </Label>
            <Input
              id="numberOfPages"
              name="numberOfPages"
              type="range"
              min="3"
              max="10"
              value={numberOfPages}
              onChange={(e) => setNumberOfPages(Number(e.target.value))}
            />
            <p className="text-sm text-gray-500">Choose between 3-10 pages</p>
          </div>

          <Button type="submit" disabled={isGenerating} className="w-full">
            {isGenerating ? "Generating..." : "Generate Book Preview"}
          </Button>
        </div>

        <GenerateBookCover />
      </div>
    </form>
  );
}
