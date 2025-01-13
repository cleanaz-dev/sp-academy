// components/StoryGenerator.js
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { saveStory, generateStory } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import {
  SelectTrigger,
  Select,
  SelectGroup,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectValue,
} from "@/components/ui/select";
import { uploadAudio } from "@/lib/storage";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="bg-purple-500">
      {pending ? "Generating..." : "Generate Story"}
    </Button>
  );
}

export default function StoryGenerator() {
  const router = useRouter();
  const [story, setStory] = useState(null);
  const [error, setError] = useState(null);
  const [audio, setAudio] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [storyImage, setStoryImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
 const [imageUrl, setImageUrl] = useState(null);

  // Generate story
  async function handleGenerateStory(formData) {
    setError(null);
    const result = await generateStory(formData);
  
    if (!result.success) {
      setError(result.error);
      return;
    }
  
    setStory(result.data);
  
    const imageDescription = formData.get("topic");
    // Generate image based on the story with more detailed prompt
    setImageLoading(true);
    try {
      // Create a more detailed prompt for better image generation
      const imagePrompt = 
        `Image of a book cover for kids story. Title: I like ${imageDescription} with a 9:16 aspect ratio`;
  
      const imageResponse = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imagePrompt }),
      });
  
      if (!imageResponse.ok) throw new Error("Failed to generate image");
  
      const imageData = await imageResponse.json();
      if (imageData.success) {
        // The image will be in base64 format
        setStoryImage(`data:image/png;base64,${imageData.imageUrl}`);
      }
    } catch (error) {
      console.error("Image generation error:", error);
      setError("Failed to generate image");
    } finally {
      setImageLoading(false);
    }
  
    // Handle audio generation if needed
    if (result.data?.frenchText) {
      try {
        const audioResponse = await fetch("/api/text-to-speech", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: result.data.frenchText }),
        });
  
        if (!audioResponse.ok) throw new Error("Failed to generate audio");
  
        const blob = await audioResponse.blob();
        setAudioBlob(blob); // Save the blob for later upload
        setAudio(URL.createObjectURL(blob));
      } catch (error) {
        setError("Failed to generate audio");
      }
    }
  }

//handle save story
const handleSaveStory = async () => { // Changed this line
  try {
    let audioUrl = null;
    let imageUrl = null; // Added this line

    if (audioBlob) {
      // Create FormData and append the audio blob
      const formData = new FormData();
      formData.append("audio", audioBlob);

      // Upload via API route
      const uploadResponse = await fetch("/api/upload-story-audio", {
        method: "POST",
        body: formData,
      });

      const uploadResult = await uploadResponse.json();
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "Failed to upload audio");
      }

      audioUrl = uploadResult.audioUrl;
    }

    // Use storyImage from state instead of parameter
    if (storyImage) { // Changed this line
      const imageBlob = await fetch(storyImage).then((r) => r.blob());
      const imageFormData = new FormData();
      imageFormData.append("image", imageBlob);

      const imageUploadResponse = await fetch("/api/upload-story-image", {
        method: "POST",
        body: imageFormData,
      });

      const imageUploadResult = await imageUploadResponse.json();
      if (!imageUploadResult.success) {
        throw new Error(imageUploadResult.error || "Failed to upload image");
      }

      imageUrl = imageUploadResult.imageUrl;
    }

    console.log("image url:", imageUrl);

    const storyData = {
      title: story.title,
      frenchText: story.frenchText,
      englishText: story.englishText,
      vocabulary: story.vocabulary,
      grammarHighlights: story.grammarHighlights,
      topic: document.querySelector('input[name="topic"]').value,
      difficulty: document.querySelector('select[name="difficulty"]').value,
      paragraphs: parseInt(
        document.querySelector('input[name="paragraphs"]').value
      ),
      genre: document.querySelector('select[name="genre"]').value,
      grammar: document.querySelector('select[name="grammar"]').value,
      audioUrl: audioUrl,
      imageUrl: imageUrl,
    };

    const result = await saveStory(storyData);

    if (result.success) {
      router.push(`/short-story/${result.id}`);
    } else {
      setError(result.error || "Failed to save story");
    }
  } catch (error) {
    console.error("Save story error:", error);
    setError(error.message || "Failed to save story");
  }
};
  return (
    <div className="p-4 ">
      <form action={handleGenerateStory}>
        <div>
          <header>
            <h1 className="header-title">Story Generator</h1>
          </header>

          <p className="mt-2">
            Generate a French story, vocabulary, and audio based on a topic and
            difficulty level.
          </p>
          {/* Story Options    */}
          <div className="my-4 max-w-96">
            <div className="mb-2">
              <Label>Genre</Label>
              <Select name="genre" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select Genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Genres:</SelectLabel>
                    <SelectItem value="adventure">Adventure</SelectItem>
                    <SelectItem value="mystery">Mystery</SelectItem>
                    <SelectItem value="fairy-tale">Fairy Tale</SelectItem>
                    <SelectItem value="daily-life">Daily Life</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="school">School</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="mb-2">
              <Label>Topic</Label>
              <Input name="topic" placeholder="Enter a topic" required />
            </div>
            <div className="mb-2">
              <Label>Difficulty</Label>
              <Select name="difficulty" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select Grade Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Grade Level</SelectLabel>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="mb-2">
              <Label>Grammar Focus</Label>
              <Select name="grammar" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select Grammar Focus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Grammar Focus</SelectLabel>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="past">
                      Past Tense (Passé Composé)
                    </SelectItem>
                    <SelectItem value="imperfect">
                      Imperfect Tense (Imparfait)
                    </SelectItem>
                    <SelectItem value="future">Future</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="mb-2">
              <Label>Learning Objectives</Label>
              <Select name="learningObjectives" multiple>
                <SelectTrigger>
                  <SelectValue placeholder="Select Learning Objectives" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Objectives</SelectLabel>
                    <SelectItem value="vocabulary">New Vocabulary</SelectItem>
                    <SelectItem value="grammar">Grammar Practice</SelectItem>
                    <SelectItem value="culture">
                      Cultural Understanding
                    </SelectItem>
                    <SelectItem value="pronunciation">
                      Pronunciation Focus
                    </SelectItem>
                    <SelectItem value="conversation">
                      Conversation Practice
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="mb-2">
              <Label>Paragraphs</Label>
              <Input
                name="paragraphs"
                type="number"
                placeholder="Enter the number of paragraphs (1-5)"
                min="1"
                max="5"
                required
              />
            </div>

            <div className="mb-2">
              <Label>Image Style</Label>
              <Select name="imageStyle">
                <SelectTrigger>
                  <SelectValue placeholder="Select Image Style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Style</SelectLabel>
                    <SelectItem value="children">
                      Children's Book Style
                    </SelectItem>
                    <SelectItem value="realistic">Realistic</SelectItem>
                    <SelectItem value="cartoon">Cartoon</SelectItem>
                    <SelectItem value="watercolor">Watercolor</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <SubmitButton />
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {imageLoading && (
        <div className="mt-4">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-xl bg-slate-200 h-48 w-full"></div>
          </div>
          <p className="text-center mt-2">Generating illustration...</p>
        </div>
      )}

      {story && (
        <div className="mt-4 space-y-6">
          {storyImage && (
            <div>
              <h2 className="text-xl font-bold">Story Illustration:</h2>
              <div className="mt-2 p-4 bg-gray-50 rounded">
                <img
                  src={storyImage}
                  alt="Story illustration"
                  className="max-w-full h-auto rounded"
                />
              </div>
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold">French Story:</h2>
            <p className="mt-2 p-4 bg-gray-50 rounded">{story.frenchText}</p>
          </div>

          <div>
            <h2 className="text-xl font-bold">English Translation:</h2>
            <p className="mt-2 p-4 bg-gray-50 rounded">{story.englishText}</p>
          </div>

          {story.grammarHighlights && (
            <div>
              <h2 className="text-xl font-bold">Grammar Highlights:</h2>
              <div className="mt-2 p-4 bg-gray-50 rounded">
                {story.grammarHighlights.map((highlight, index) => (
                  <div
                    key={index}
                    className="mb-3 p-3 border-l-4 border-blue-500"
                  >
                    <p className="font-semibold text-blue-600">
                      {highlight.expression}
                    </p>
                    <p className="text-gray-600 mt-1">
                      {highlight.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {story.vocabulary && (
            <div>
              <h2 className="text-xl font-bold">Vocabulary:</h2>
              <ul className="mt-2 p-4 bg-gray-50 rounded grid grid-cols-1 md:grid-cols-2 gap-3">
                {story.vocabulary.map((word, index) => (
                  <li
                    key={index}
                    className="mb-2 p-2 border border-gray-200 rounded"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <strong className="text-blue-600">{word.french}</strong>
                        <span className="mx-2">→</span>
                        <span>{word.english}</span>
                      </div>
                      <span className="text-sm text-gray-500 italic">
                        {word.grammarType}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {audio && (
            <div>
              <h2 className="text-xl font-bold">Listen:</h2>
              <div className="mt-2 p-4 bg-gray-50 rounded">
                <audio
                  controls
                  src={audio}
                  className="w-full"
                  onError={(e) => {
                    console.error("Audio playback error:", e);
                    setError("Failed to play audio");
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {story && (
        <div className="mt-2">
          <Button onClick={handleSaveStory}>Save Short Story</Button>
        </div>
      )}
    </div>
  );
}
