// components/short-stories/StoryGenerator.jsx
"use client";
import { useState } from "react";
import { Button } from "@/components/old-ui/button";
import { Label } from "@/components/old-ui/label";
import { Input } from "@/components/old-ui/input";
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
} from "@/components/old-ui/select";
import { uploadAudio } from "@/lib/storage";
import InteractiveExercises from "./InteractiveExercises";

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
  const [exercises, setExercises] = useState(null);

  // Generate story
  async function handleGenerateStory(formData) {
    setError(null);
    try {
      const result = await generateStory(formData);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setStory(result.data);

      // Generate exercises
      try {
        const exercisePrompt = `
            Generate 6 French language learning exercises based on this story: "${result.data.frenchText}"

            Please create:
            1. Two multiple-choice vocabulary questions
            2. Two fill-in-the-blank grammar exercises
            3. One French-English matching exercise
            4. One sentence ordering exercise. Only provide 5-6 scrambled words of a sentence.


            Format your response as a valid JSON object with this exact structure:
            {
              "exercises": [
                {
                  "id": "1",
                  "type": "multiple-choice",
                  "question": "What does [word] mean in English?",
                  "options": ["option1", "option2", "option3", "option4"],
                  "correctAnswer": "correct option"
                },
                {
                  "id": "2",
                  "type": "fill-in-blanks",
                  "question": "Complete this sentence: _____ [rest of sentence]",
                  "correctAnswer": "correct word"
                },
                {
                  "id": "3",
                  "type": "matching",
                  "question": "Match the French words with their English translations",
                  "pairs": [
                    {"left": "French word", "right": "English translation"}
                  ]
                },
                {
                  "id": "4",
                  "type": "sentence-order",
                  "question": "Arrange the words to form a correct French sentence",
                  "parts": ["part1", "part2", "part3", "part4"],
                  "correctOrder": [0, 1, 2, 3],
                  "correctSentence": "Full correct sentence"
                }
              ]
            }

            ONLY OUTPUT JSON`;

        const exerciseResponse = await fetch("/api/generate-exercises", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: exercisePrompt }),
        });

        if (!exerciseResponse.ok)
          throw new Error("Failed to generate exercises");

        const exerciseData = await exerciseResponse.json();
        if (exerciseData.success) {
          setExercises(exerciseData.exercises);
        }
      } catch (error) {
        console.error("Exercise generation error:", error);
        setError("Failed to generate exercises");
      }

      // const updatedExercises = await Promise.all(
      //   exercises.map(async (exercise) => {
      //     if (exercise.type === 'image-sentence') {
      //       const imagePrompt = exercise.sceneDescription;
      //       const imageResponse = await fetch('/api/generate-image', {
      //         method: 'POST',
      //         headers: { 'Content-Type': 'application/json' },
      //         body: JSON.stringify({ prompt: imagePrompt }),
      //       });

      //       if (!imageResponse.ok) {
      //         throw new Error('Failed to generate image');
      //       }

      //       const imageData = await imageResponse.json();
      //       if (imageData.success) {
      //         exercise.imageUrl = imageData.imageUrl;
      //       }
      //     }
      //     return exercise;
      //   })
      // );

      // setExercises(updatedExercises);

      // Generate image
      const imageDescription = formData.get("topic");
      setImageLoading(true);
      try {
        const imagePrompt = `Image of a book cover for kids story. Title: I like ${imageDescription} with a 16:9 aspect ratio`;

        const imageResponse = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: imagePrompt }),
        });

        if (!imageResponse.ok) throw new Error("Failed to generate image");

        const imageData = await imageResponse.json();
        if (imageData.success) {
          setStoryImage(`data:image/png;base64,${imageData.imageUrl}`);
        }
      } catch (error) {
        console.error("Image generation error:", error);
        setError("Failed to generate image");
      } finally {
        setImageLoading(false);
      }

      // Generate audio
      if (result.data?.frenchText) {
        try {
          const audioResponse = await fetch("/api/text-to-speech", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: result.data.frenchText }),
          });

          if (!audioResponse.ok) throw new Error("Failed to generate audio");

          const blob = await audioResponse.blob();
          setAudioBlob(blob);
          setAudio(URL.createObjectURL(blob));
        } catch (error) {
          setError("Failed to generate audio");
        }
      }
    } catch (error) {
      console.error("Story generation error:", error);
      setError(error.message || "Failed to generate story and exercises");
    }
  }

  //handle save story
  const handleSaveStory = async () => {
    try {
      let audioUrl = null;
      let imageUrl = null;

      if (audioBlob) {
        const formData = new FormData();
        formData.append("audio", audioBlob);

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

      if (storyImage) {
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

      const storyData = {
        title: story.title,
        frenchText: story.frenchText,
        englishText: story.englishText,
        vocabulary: story.vocabulary,
        grammarHighlights: story.grammarHighlights,
        topic: document.querySelector('input[name="topic"]').value,
        difficulty: document.querySelector('select[name="difficulty"]').value,
        paragraphs: parseInt(
          document.querySelector('input[name="paragraphs"]').value,
        ),
        genre: document.querySelector('select[name="genre"]').value,
        grammar: document.querySelector('select[name="grammar"]').value,
        audioUrl: audioUrl,
        imageUrl: imageUrl,
        exercises: exercises, // Add exercises to the saved data
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
    <div className="p-4">
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
        <div className="mt-4 rounded bg-red-100 p-4 text-red-700">
          Error: {error}
        </div>
      )}

      {imageLoading && (
        <div className="mt-4">
          <div className="flex animate-pulse space-x-4">
            <div className="h-48 w-full rounded-xl bg-slate-200"></div>
          </div>
          <p className="mt-2 text-center">Generating illustration...</p>
        </div>
      )}

      {story && (
        <div className="mt-4 space-y-6">
          {storyImage && (
            <div>
              <h2 className="text-xl font-bold">Story Illustration:</h2>
              <div className="mt-2 rounded bg-gray-50 p-4">
                <img
                  src={storyImage}
                  alt="Story illustration"
                  className="h-auto max-w-full rounded"
                />
              </div>
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold">French Story:</h2>
            <p className="mt-2 rounded bg-gray-50 p-4">{story.frenchText}</p>
          </div>

          <div>
            <h2 className="text-xl font-bold">English Translation:</h2>
            <p className="mt-2 rounded bg-gray-50 p-4">{story.englishText}</p>
          </div>

          {story.grammarHighlights && (
            <div>
              <h2 className="text-xl font-bold">Grammar Highlights:</h2>
              <div className="mt-2 rounded bg-gray-50 p-4">
                {story.grammarHighlights.map((highlight, index) => (
                  <div
                    key={index}
                    className="mb-3 border-l-4 border-blue-500 p-3"
                  >
                    <p className="font-semibold text-blue-600">
                      {highlight.expression}
                    </p>
                    <p className="mt-1 text-gray-600">
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
              <ul className="mt-2 grid grid-cols-1 gap-3 rounded bg-gray-50 p-4 md:grid-cols-2">
                {story.vocabulary.map((word, index) => (
                  <li
                    key={index}
                    className="mb-2 rounded border border-gray-200 p-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <strong className="text-blue-600">{word.french}</strong>
                        <span className="mx-2">→</span>
                        <span>{word.english}</span>
                      </div>
                      <span className="text-sm italic text-gray-500">
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
              <div className="mt-2 rounded bg-gray-50 p-4">
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

      {/* Add the InteractiveExercises component here */}
      {exercises && (
        <div className="mt-6 border-t pt-6">
          <InteractiveExercises exercises={exercises} />
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
