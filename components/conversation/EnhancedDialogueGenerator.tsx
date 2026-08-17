// components/conversation/EnhancedDialogueGenerator.jsx
"use client";
import { useState } from "react";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import NewGeneratedDialogue from "./NewGeneratedDialogue";
import { BookOpen, MessageSquare, Info, CheckCircle } from "lucide-react";
import { AVAILABLE_LANGUAGES, LEARNING_CONTENT } from "@/lib/config/dialog-config";



export default function EnhancedDialogueGenerator() {
  const [selectedScenario, setSelectedScenario] = useState("");
  const [scenarioTitle, setScenarioTitle] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedFocus, setSelectedFocus] = useState("");
  const [generatedScenario, setGeneratedScenario] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConversation, setShowConversation] = useState(false);
  const [nativeLanguage, setNativeLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("fr");

  // Preview state for showing relevant information based on selections
  const [preview, setPreview] = useState({
    vocabulary: [],
    keyPhrases: [],
    culturalNotes: [],
    levelRequirements: null,
  });

  const updatePreview = (scenario, level, focus) => {
    const selectedScenario = LEARNING_CONTENT.scenarios.find(
      (s) => s.id === scenario,
    );
    const selectedLevel = level
      ? LEARNING_CONTENT.levels.find((l) => l.id === level)
      : null;

    const newPreview = {
      // Get key phrases for the selected level
      keyPhrases:
        selectedScenario && level
          ? selectedScenario.context.keyPhrases[level].map(
              (item) => item.phrase,
            )
          : [],

      // Get vocabulary with context for the selected level
      vocabulary:
        selectedScenario && level
          ? selectedScenario.context.vocabulary[level].map((item) => ({
              word: item.word,
              context: item.context,
            }))
          : [],

      // Get cultural notes
      culturalNotes: selectedScenario
        ? selectedScenario.context.culturalNotes
        : [],

      // Get level requirements if level is selected
      levelRequirements: selectedLevel ? selectedLevel.requirements : null,
    };
    setPreview(newPreview);
  };

  const handleGenerate = async () => {
    if (!selectedScenario || !selectedLevel || !selectedFocus) {
      setError("Please select all options");
      return;
    }

    setLoading(true);
    setError("");
    setShowConversation(false);

    try {
      const selectedScenarioData = LEARNING_CONTENT.scenarios.find(
        (s) => s.id === selectedScenario,
      );
      const levelRequirements = LEARNING_CONTENT.levels.find(
        (l) => l.id === selectedLevel,
      )?.requirements;
      const focusObjectives = LEARNING_CONTENT.focusAreas.find(
        (f) => f.id === selectedFocus,
      )?.learningObjectives;

      const response = await fetch("/api/generate/generate-dialogue-test-copy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          languages: {
            native: nativeLanguage,
            target: targetLanguage,
          },
          scenario: {
            type: selectedScenario,
            context: selectedScenarioData.context,
            label: selectedScenarioData.context.label,
            keyPhrases: selectedScenarioData.context.keyPhrases[selectedLevel],
            vocabulary: selectedScenarioData.context.vocabulary[selectedLevel],
            culturalNotes: selectedScenarioData.context.culturalNotes,
            roles: selectedScenarioData.context.roles,
            situation: selectedScenarioData.context.situation,
          },
          level: {
            type: selectedLevel,
            requirements: levelRequirements,
            label: LEARNING_CONTENT.levels.find((l) => l.id === selectedLevel)
              ?.label,
          },
          focus: {
            type: selectedFocus,
            objectives: focusObjectives,
            label: LEARNING_CONTENT.focusAreas.find(
              (f) => f.id === selectedFocus,
            )?.label,
          },
        }),
      });

      const data = await response.json();
      if (response.ok) {
        const enhancedScenario = {
          title: scenarioTitle || "",
          ...data.scenario,
          introduction: {
            // Use the correct keys instead of language codes
            targetLanguage: data.scenario.introduction?.targetLanguage || "",
            nativeLanguage: data.scenario.introduction?.nativeLanguage || "",
          },
          vocabulary: data.scenario.vocabulary || [],
          dialogue: data.scenario.dialogue || [],
          culturalNotes: data.scenario.culturalNotes || [],
          keyPhrases: data.scenario.keyPhrases || [],
        };

        setGeneratedScenario(enhancedScenario);
        setShowConversation(true);
      } else {
        throw new Error(data.error || "Failed to generate scenario");
      }
    } catch (err) {
      setError(err.message);
      console.error("Generation error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4 max-w-2xl">
      {!generatedScenario && (
        <div className="my-6 space-y-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label className="mb-2 block text-sm font-medium">
                Your Language
              </Label>
              <Select value={nativeLanguage} onValueChange={setNativeLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your language..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(AVAILABLE_LANGUAGES).map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Label className="mb-2 block text-sm font-medium">
                Language to Learn
              </Label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language to learn..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(AVAILABLE_LANGUAGES)
                    .filter((lang) => lang.code !== nativeLanguage)
                    .map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Select Scenario */}
          <div>
            <Label className="mb-2 block text-sm font-medium">
              Select Scenario
            </Label>
            <Select
              onValueChange={(value) => {
                setSelectedScenario(value);
                const selectedScenarioObj = LEARNING_CONTENT.scenarios.find(
                  (scenario) => scenario.id === value,
                );
                setScenarioTitle(selectedScenarioObj?.context.label || "");
                updatePreview(value, selectedLevel, selectedFocus);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a scenario..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>
                    <span className="text-lg font-bold">Health</span>
                  </SelectLabel>
                  {LEARNING_CONTENT.scenarios
                    .filter((scenario) => scenario.category === "Health")
                    .map((scenario) => (
                      <SelectItem key={scenario.id} value={scenario.id}>
                        {scenario.context.label[targetLanguage] ||
                          scenario.context.label}
                      </SelectItem>
                    ))}
                </SelectGroup>

                <SelectGroup>
                  <SelectLabel>
                    <span className="text-lg font-bold">Leisure</span>
                  </SelectLabel>
                  {LEARNING_CONTENT.scenarios
                    .filter((scenario) => scenario.category === "Leisure")
                    .map((scenario) => (
                      <SelectItem key={scenario.id} value={scenario.id}>
                        {scenario.context.label[targetLanguage] ||
                          scenario.context.label}
                      </SelectItem>
                    ))}
                </SelectGroup>

                <SelectGroup>
                  <SelectLabel>
                    <span className="text-lg font-bold">Food</span>
                  </SelectLabel>
                  {LEARNING_CONTENT.scenarios
                    .filter((scenario) => scenario.category === "Food")
                    .map((scenario) => (
                      <SelectItem key={scenario.id} value={scenario.id}>
                        {scenario.context.label[targetLanguage] ||
                          scenario.context.label}
                      </SelectItem>
                    ))}
                </SelectGroup>

                <SelectGroup>
                  <SelectLabel>
                    <span className="text-lg font-bold">School</span>
                  </SelectLabel>
                  {LEARNING_CONTENT.scenarios
                    .filter((scenario) => scenario.category === "School")
                    .map((scenario) => (
                      <SelectItem key={scenario.id} value={scenario.id}>
                        {scenario.context.label[targetLanguage] ||
                          scenario.context.label}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block text-sm font-medium">
              Select Level
            </Label>
            <Select
              onValueChange={(value) => {
                setSelectedLevel(value);
                updatePreview(selectedScenario, value, selectedFocus);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose your level..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>
                    <span className="text-lg font-bold">Available Levels</span>
                  </SelectLabel>
                  {LEARNING_CONTENT.levels.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block text-sm font-medium">
              Select Focus Area
            </Label>
            <Select
              onValueChange={(value) => {
                setSelectedFocus(value);
                updatePreview(selectedScenario, selectedLevel, value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose your focus..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>
                    <span className="text-lg font-bold">Focus Areas</span>
                  </SelectLabel>
                  {LEARNING_CONTENT.focusAreas.map((focus) => (
                    <SelectItem key={focus.id} value={focus.id}>
                      {focus.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Preview Section */}
          {(preview.vocabulary.length > 0 ||
            preview.keyPhrases.length > 0 ||
            preview.culturalNotes.length > 0 ||
            preview.levelRequirements) && (
            <div className="mt-4 space-y-4 rounded-lg bg-white p-4 shadow-md">
              <h3 className="mb-4 text-xl font-semibold text-gray-800">
                Learning Preview
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Vocabulary Section */}
                {preview.vocabulary.length > 0 && (
                  <div className="rounded-lg bg-gray-100 p-4 shadow-sm">
                    <div className="mb-2 flex items-center">
                      <BookOpen className="mr-2 text-blue-500" />
                      <p className="font-medium text-gray-800">
                        Key Vocabulary:
                      </p>
                    </div>
                    <ul className="space-y-1 text-sm">
                      {preview.vocabulary.map((item, idx) => (
                        <li key={idx} className="flex items-center">
                          <CheckCircle
                            className="mr-2 text-green-500"
                            size={16}
                          />
                          <span className="font-medium">{item.word}</span>
                          {item.context && (
                            <span className="text-gray-600">
                              {" "}
                              - {item.context}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Key Phrases Section */}
                {preview.keyPhrases.length > 0 && (
                  <div className="rounded-lg bg-gray-100 p-4 shadow-sm">
                    <div className="mb-2 flex items-center">
                      <MessageSquare className="mr-2 text-blue-500" />
                      <p className="font-medium text-gray-800">
                        Common Phrases:
                      </p>
                    </div>
                    <ul className="list-inside list-disc text-sm">
                      {preview.keyPhrases.map((phrase, idx) => (
                        <li key={idx}>{phrase}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Cultural Notes Section */}
                {preview.culturalNotes.length > 0 && (
                  <div className="rounded-lg bg-gray-100 p-4 shadow-sm">
                    <div className="mb-2 flex items-center">
                      <Info className="mr-2 text-blue-500" />
                      <p className="font-medium text-gray-800">
                        Cultural Notes:
                      </p>
                    </div>
                    <ul className="list-outside list-disc pl-4 text-sm">
                      {preview.culturalNotes.map((note, idx) => (
                        <li key={idx}>{note}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Level Requirements Section */}
                {preview.levelRequirements && (
                  <div className="rounded-lg bg-gray-100 p-4 shadow-sm">
                    <div className="mb-2 flex items-center">
                      <CheckCircle className="mr-2 text-blue-500" />
                      <p className="font-medium text-gray-800">
                        Level Requirements:
                      </p>
                    </div>
                    <ul className="list-outside list-disc pl-4 text-sm">
                      <li>
                        Vocabulary: {preview.levelRequirements.vocabulary} words
                      </li>
                      <li>
                        Expected Fluency:{" "}
                        {preview.levelRequirements.expectedFluency}
                      </li>
                      <li>
                        Grammar Topics:{" "}
                        {preview.levelRequirements.grammarTopics.join(", ")}
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Generating..." : "Generate Conversation Scenario"}
          </Button>

          {error && (
            <div className="rounded bg-red-50 p-2 text-sm text-red-500">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Generated Scenario Display */}
      {generatedScenario && (
        <NewGeneratedDialogue
          scenario={generatedScenario}
          level={selectedLevel}
          focusArea={selectedFocus}
          nativeLanguage={nativeLanguage}
          targetLanguage={targetLanguage}
          title={
            LEARNING_CONTENT.scenarios.find((s) => s.id === selectedScenario)
              ?.context.label
          }
        />
      )}
    </div>
  );
}
