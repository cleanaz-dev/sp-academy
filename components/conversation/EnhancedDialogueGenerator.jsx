// components/conversation/EnhancedDialogueGenerator.jsx
"use client";
import { useState } from "react";
import ConversationInterface from "./ConversationInterface";
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
import GeneratedDialogue from "./GeneratedDialogue";

// Enhanced Learning Content Structure
const LEARNING_CONTENT = {
  scenarios: [
    {
      id: "doctor",
      label: "Doctor Check-up",
      category: "Health",
      context: {
        location: "medical_clinic",
        roles: ["patient", "doctor"],
        commonPhrases: ["Je ne me sens pas bien", "Où avez-vous mal?"],
        vocabulary: {
          beginner: ["docteur", "malade", "médicament"],
          intermediate: ["ordonnance", "symptômes", "traitement"],
          advanced: ["diagnostic", "prescription", "consultation"],
        },
      },
    },
    {
      id: "dentist",
      label: "Dentist Visit",
      category: "Health",
      context: {
        location: "dental_clinic",
        roles: ["patient", "dentist"],
        commonPhrases: [
          "J'ai mal aux dents",
          "Quand est mon prochain rendez-vous?",
        ],
        vocabulary: {
          beginner: ["dentiste", "dent", "brosse à dents"],
          intermediate: ["cavité", "plombage", "nettoyage"],
          advanced: ["orthodontie", "prothèse", "parodontie"],
        },
      },
    },

    {
      id: "restaurant",
      label: "Restaurant",
      category: "Leisure",
      context: {
        location: "restaurant",
        roles: ["customer", "waiter"],
        commonPhrases: ["Je voudrais commander", "L'addition, s'il vous plaît"],
        vocabulary: {
          beginner: ["menu", "table", "manger"],
          intermediate: ["réservation", "commander", "plat principal"],
          advanced: [
            "suggestion du chef",
            "accord mets et vins",
            "spécialités",
          ],
        },
      },
    },
    {
      id: "shopping",
      label: "Shopping for Clothes",
      category: "Leisure",
      context: {
        location: "clothing_store",
        roles: ["customer", "sales_assistant"],
        commonPhrases: ["Je cherche", "Quelle est votre taille?"],
        vocabulary: {
          beginner: ["vêtements", "taille", "prix"],
          intermediate: ["essayer", "remboursement", "promotion"],
          advanced: ["sur mesure", "collection", "tendance"],
        },
      },
    },
    {
      id: "classroom",
      label: "In the Classroom",
      category: "School",
      context: {
        location: "classroom",
        roles: ["student", "teacher"],
        commonPhrases: [
          "Puis-je poser une question?",
          "Quels sont les devoirs pour demain?",
        ],
        vocabulary: {
          beginner: ["classe", "cahier", "devoirs"],
          intermediate: ["leçon", "examen", "note"],
          advanced: ["curriculum", "pédagogie", "évaluation"],
        },
      },
    },
    {
      id: "library",
      label: "In the School Library",
      category: "School",
      context: {
        location: "library",
        roles: ["student", "librarian"],
        commonPhrases: [
          "Puis-je emprunter ce livre?",
          "Où puis-je trouver des informations sur ce sujet?",
        ],
        vocabulary: {
          beginner: ["livre", "bibliothèque", "étagère"],
          intermediate: ["emprunter", "recherche", "catalogue"],
          advanced: ["référence", "index", "documentation"],
        },
      },
    },
  ],

  levels: [
    {
      id: "beginner",
      label: "Beginner (A1)",
      requirements: {
        vocabulary: 500,
        grammarTopics: ["present tense", "basic questions"],
        expectedFluency: "basic phrases",
        conversationGoals: [
          "simple greetings",
          "basic needs",
          "short responses",
        ],
      },
    },
    {
      id: "intermediate",
      label: "Intermediate (B1)",
      requirements: {
        vocabulary: 2000,
        grammarTopics: ["past tense", "future tense", "conditionals"],
        expectedFluency: "fluid conversation",
        conversationGoals: [
          "express opinions",
          "describe experiences",
          "make suggestions",
        ],
      },
    },
    {
      id: "advanced",
      label: "Advanced (B2)",
      requirements: {
        vocabulary: 4000,
        grammarTopics: [
          "subjunctive",
          "complex structures",
          "idiomatic expressions",
        ],
        expectedFluency: "natural conversation",
        conversationGoals: [
          "debate topics",
          "handle complex situations",
          "express nuanced opinions",
        ],
      },
    },
  ],

  focusAreas: [
    {
      id: "vocabulary",
      label: "Vocabulary Building",
      learningObjectives: [
        "Learn new contextual words",
        "Practice word families",
        "Master common phrases",
      ],
      assessmentMethods: ["word recognition", "usage in context"],
    },
    {
      id: "grammar",
      label: "Grammar Practice",
      learningObjectives: [
        "Master verb conjugations",
        "Use correct sentence structures",
        "Apply grammar rules in context",
      ],
      assessmentMethods: ["sentence construction", "error correction"],
    },
    {
      id: "pronunciation",
      label: "Pronunciation",
      learningObjectives: [
        "Perfect sound production",
        "Master French phonetics",
        "Natural rhythm and intonation",
      ],
      assessmentMethods: ["sound recognition", "pronunciation accuracy"],
    },
  ],
};

export default function EnhancedDialogueGenerator() {
  const [selectedScenario, setSelectedScenario] = useState("");
  const [scenarioTitle, setScenarioTitle] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedFocus, setSelectedFocus] = useState("");
  const [generatedScenario, setGeneratedScenario] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConversation, setShowConversation] = useState(false);

  // Preview state for showing relevant information based on selections
  const [preview, setPreview] = useState({
    vocabulary: [],
    objectives: [],
    requirements: null,
  });

  const updatePreview = (scenario, level, focus) => {
    const newPreview = {
      vocabulary:
        scenario && level
          ? LEARNING_CONTENT.scenarios.find((s) => s.id === scenario)?.context
              .vocabulary[level] || []
          : [],
      objectives: focus
        ? LEARNING_CONTENT.focusAreas.find((f) => f.id === focus)
            ?.learningObjectives || []
        : [],
      requirements: level
        ? LEARNING_CONTENT.levels.find((l) => l.id === level)?.requirements ||
          null
        : null,
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
      const scenarioContext = LEARNING_CONTENT.scenarios.find(
        (s) => s.id === selectedScenario
      )?.context;
      const levelRequirements = LEARNING_CONTENT.levels.find(
        (l) => l.id === selectedLevel
      )?.requirements;
      const focusObjectives = LEARNING_CONTENT.focusAreas.find(
        (f) => f.id === selectedFocus
      )?.learningObjectives;

      const response = await fetch("/api/generate-dialogue-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scenario: {
            type: selectedScenario,
            context: scenarioContext,
            setting: LEARNING_CONTENT.scenarios.find(
              (s) => s.id === selectedScenario
            )?.label,
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
              (f) => f.id === selectedFocus
            )?.label,
          },
        }),
      });

      const data = await response.json();
      if (response.ok) {
        // Transform the response if needed to match the component structure
        const enhancedScenario = {
          title: scenarioTitle || "",
          ...data.scenario,
          // Ensure all required sections are present
          introduction: data.scenario.introduction || {
            french: data.scenario.scenarioSetup?.french || "",
            english: data.scenario.scenarioSetup?.english || "",
          },
          vocabulary:
            data.scenario.vocabulary || data.scenario.keyVocabulary || [],
          dialogue:
            data.scenario.dialogue || data.scenario.conversationFlow || [],
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
    <div className="max-w-2xl mb-4">
      <h1 className="header-title">French Conversation Generator</h1>

      {!generatedScenario && (
        // Selection Form
        <div className="space-y-6 my-6">
          <div>
            <Label className="block text-sm font-medium mb-2">
              Select Scenario
            </Label>
            <Select
              onValueChange={(value) => {
                setSelectedScenario(value);
                // Find the selected scenario and set its label as the title
                const selectedScenarioObj = LEARNING_CONTENT.scenarios.find(
                  (scenario) => scenario.id === value
                );
                setScenarioTitle(selectedScenarioObj?.label || ""); 
                updatePreview(value, selectedLevel, selectedFocus);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a scenario..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>
                    <span className="font-bold text-lg">Health</span>
                  </SelectLabel>
                  {LEARNING_CONTENT.scenarios
                    .filter((scenario) => scenario.category === "Health")
                    .map((scenario) => (
                      <SelectItem key={scenario.id} value={scenario.id}>
                        {scenario.label}
                      </SelectItem>
                    ))}
                </SelectGroup>

                <SelectGroup>
                  <SelectLabel>
                    <span className="font-bold text-lg">Leisure</span>
                  </SelectLabel>
                  {LEARNING_CONTENT.scenarios
                    .filter((scenario) => scenario.category === "Leisure")
                    .map((scenario) => (
                      <SelectItem key={scenario.id} value={scenario.id}>
                        {scenario.label}
                      </SelectItem>
                    ))}
                </SelectGroup>

                <SelectGroup>
                  <SelectLabel>
                    <span className="font-bold text-lg">School</span>
                  </SelectLabel>
                  {LEARNING_CONTENT.scenarios
                    .filter((scenario) => scenario.category === "School")
                    .map((scenario) => (
                      <SelectItem key={scenario.id} value={scenario.id}>
                        {scenario.label}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2">
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
                    <span className="font-bold text-lg">Available Levels</span>
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
            <Label className="block text-sm font-medium mb-2">
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
                    <span className="font-bold text-lg">Focus Areas</span>
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
          {(preview.vocabulary.length > 0 || preview.objectives.length > 0) && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Learning Preview</h3>
             
              {preview.vocabulary.length > 0 && (
                <div className="mb-2">
                  <p className="font-medium">Key Vocabulary:</p>
                  <p className="text-sm">{preview.vocabulary.join(", ")}</p>
                </div>
              )}
              {preview.objectives.length > 0 && (
                <div>
                  <p className="font-medium">Learning Objectives:</p>
                  <ul className="text-sm list-disc list-inside">
                    {preview.objectives.map((obj, idx) => (
                      <li key={idx}>{obj}</li>
                    ))}
                  </ul>
                </div>
              )}
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
            <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Generated Scenario Display */}
      {generatedScenario && (
        <GeneratedDialogue
          scenario={generatedScenario}
          level={selectedLevel}
          focusArea={selectedFocus}
        />
      )}
    </div>
  );
}
