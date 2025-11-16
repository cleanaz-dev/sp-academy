//components/conversation/DialogueGenerator.jsx
"use client";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import ConversationInterface from "./ConversationInterface";
import { Label } from "../../old-ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../old-ui/select";
import { Button } from "../../old-ui/button";

const scenarios = [
  { id: "doctor", label: "At the Doctor's Office" },
  { id: "restaurant", label: "At a Restaurant" },
  { id: "shopping", label: "Shopping for Clothes" },
  { id: "hotel", label: "Hotel Check-in" },
  { id: "interview", label: "Interview Preparation" },
  { id: "family", label: "Family Life" },
  { id: "airport", label: "Airport Check-in" },
  // Add more scenarios as needed
];

const levels = [
  { id: "beginner", label: "Beginner (A1)" },
  { id: "elementary", label: "Elementary (A2)" },
  { id: "intermediate", label: "Intermediate (B1)" },
  { id: "advanced", label: "Advanced (B2)" },
];

const focusAreas = [
  { id: "vocabulary", label: "Vocabulary Building" },
  { id: "grammar", label: "Grammar Practice" },
  { id: "pronunciation", label: "Pronunciation" },
  { id: "fluency", label: "Conversation Fluency" },
];

export default function DialogueGenerator() {
  const [selectedScenario, setSelectedScenario] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedFocus, setSelectedFocus] = useState("");
  const [generatedScenario, setGeneratedScenario] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConversation, setShowConversation] = useState(false);

  const handleGenerate = async () => {
    if (!selectedScenario || !selectedLevel || !selectedFocus) {
      setError("Please select all options");
      return;
    }

    setLoading(true);
    setError("");
    setShowConversation(false); // Reset conversation view

    try {
      const response = await fetch("/api/generate-dialogue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scenario: selectedScenario,
          level: selectedLevel,
          focus: selectedFocus,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setGeneratedScenario(data.scenario);
        setShowConversation(true); // Show conversation interface after successful generation
      } else {
        throw new Error(data.error || "Failed to generate scenario");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl p-6">
      <h1 className="header-title">French Dialogue Generator</h1>

      {/* Scenario Generation Form */}

      <div className="my-6 space-y-4">
        <div>
          <Label className="mb-2 block text-sm font-medium">
            Select Scenario
          </Label>
          <Select onValueChange={(value) => setSelectedScenario(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a scenario..." />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                <SelectLabel>Scenarios:</SelectLabel>
                {scenarios.map((scenario) => (
                  <SelectItem key={scenario.id} value={scenario.id}>
                    {scenario.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {/* <select
            value={selectedScenario}
            onChange={(e) => setSelectedScenario(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Choose a scenario...</option>
            {scenarios.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.label}
              </option>
            ))}
          </select> */}
        </div>

        <div>
          <Label className="mb-2 block text-sm font-medium">Select Level</Label>
          <Select onValueChange={(value) => setSelectedLevel(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a level..." />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                <SelectLabel>Levels:</SelectLabel>
                {levels.map((level) => (
                  <SelectItem key={level.id} value={level.id}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* <Label className="block text-sm font-medium mb-2">Select Level</Label>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Choose a level...</option>
            {levels.map((level) => (
              <option key={level.id} value={level.id}>
                {level.label}
              </option>
            ))}
          </select>
        </div> */}

        <div>
          <Label className="mb-2 block text-sm font-medium">
            Select Focus Area
          </Label>
          <Select onValueChange={(value) => setSelectedFocus(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a focus area..." />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                <SelectLabel>Focus Areas:</SelectLabel>
                {focusAreas.map((focus) => (
                  <SelectItem key={focus.id} value={focus.id}>
                    {focus.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* <div>
          <label className="block text-sm font-medium mb-2">
            Learning Focus
          </label>
          <select
            value={selectedFocus}
            onChange={(e) => setSelectedFocus(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Choose a focus area...</option>
            {focusAreas.map((focus) => (
              <option key={focus.id} value={focus.id}>
                {focus.label}
              </option>
            ))}
          </select>
        </div> */}

        <Button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full rounded bg-blue-500 p-2 text-white hover:bg-blue-600 disabled:bg-gray-300"
        >
          {loading ? "Generating..." : "Generate Dialogue Scenario"}
        </Button>

        {error && <div className="text-sm text-red-500">{error}</div>}
      </div>

      {/* Generated Scenario Display */}
      {generatedScenario && (
        <div className="mt-6 rounded border bg-gray-50 p-4">
          <ReactMarkdown className="prose max-w-none">
            {generatedScenario}
          </ReactMarkdown>
        </div>
      )}

      {/* Conversation Interface */}
      {showConversation && (
        <div className="mt-6">
          <h2 className="mb-4 text-xl font-bold">Practice Conversation 😎</h2>
          <ConversationInterface scenarioContext={generatedScenario} />
        </div>
      )}
    </div>
  );
}
