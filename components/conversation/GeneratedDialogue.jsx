// components/conversation/GeneratedDialogue.jsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Info } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation"

export default function GeneratedDialogue({ scenario, level, focusArea }) {
  const [activePhrase, setActivePhrase] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useUser();
  const router = useRouter();

  // Parse the scenario data (assuming it comes in a structured format)
  const { introduction, vocabulary, phrases, characters, dialogue, title } =
    scenario;

    const handleSaveScenario = async () => {
      setIsLoading(true);
      setError(null); // Clear any previous errors
    
      try {
        const scenarioData = JSON.stringify({
          introduction: {
            french: introduction.french,
            english: introduction.english,
          },
          vocabulary,
          phrases,
          characters,
          dialogue,
          title,
          userId: user.id,
        });
    
        const response = await fetch("/api/conversation/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: scenarioData,
        });
    
        // Check if the response is ok
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to save scenario.");
        }
    
        console.log("Scenario saved successfully.");
      } catch (error) {
        console.error("Failed to save scenario:", error);
        setError(error.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
        
        router.push("/conversation");

      }
    };
    

  return (
    <Card className="mt-4 p-4 space-y-6 ">
      <div className="flex justify-between items-center">
        <h2 className="text-lg md:text-2xl font-bold">
          Generated Conversation
        </h2>
        <div className="flex gap-2">
          <Badge variant="outline">{level}</Badge>
          <Badge variant="outline">{focusArea}</Badge>
        </div>
      </div>

      <Tabs defaultValue="scenario" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scenario">
            <span className="text-xs md:text-base">Scenario</span>
          </TabsTrigger>
          <TabsTrigger value="vocabulary">
            <span className="text-xs md:text-base">Vocabulary</span>
          </TabsTrigger>
          <TabsTrigger value="dialogue">
            <span className="text-xs md:text-base">Dialogue</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scenario" className="mt-4 ">
          <Card className="p-4 ">
            <h3 className="font-semibold mb-3">Scenario Introduction</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-bold mb-2">French</h4>
                <p className="text-gray-700 text-sm md:text-base bg-slate-100 p-2 rounded-md">
                  {introduction.french}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-bold mb-2">English</h4>
                <p className="text-gray-700 text-sm md:text-base bg-slate-100 p-2 rounded-md">
                  {introduction.english}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold mb-3">Characters</h3>
              <div className="grid grid-cols-2 gap-4">
                {characters.map((character, index) => (
                  <Card key={index} className="p-3">
                    <h4 className="font-bold text-sm md:text-base">
                      {character.role}
                    </h4>
                    <p className="text-xs md:text-sm text-gray-600">
                      {character.description}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="vocabulary" className="mt-4">
          <Card className="p-4 shadow-lg border border-gray-200">
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {vocabulary.map((word, index) => (
                  <div
                    key={index}
                    className="p-2 bg-white hover:bg-sky-100 border-l-4 transition-all rounded-lg shadow-lg cursor-pointer"
                    onClick={() => setActivePhrase(word)}
                  >
                    <div className="flex flex-col justify-start items-start">
                      <h4 className="font-bold text-lg text-sky-600 dark:text-sky-300 mb-1">
                        {word.french} /{" "}
                        <span className="text-slate-500 font-normal">
                          {word.english}
                        </span>
                      </h4>
                      {word.example && (
                        <p className="flex items-center text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <Info className="size-4 mr-2" /> {word.example}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>
        <TabsContent value="dialogue" className="mt-4">
          <Card className="p-4 shadow-lg border border-gray-200">
            <ScrollArea className="h-[400px] pr-4">
              {dialogue.map((exchange, index) => (
                <div
                  key={index}
                  className={`mb-4 p-3 rounded-lg transition-all ${
                    index % 2 === 0 ? "bg-sky-100" : "bg-purple-100"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className="font-bold text-xs md:text-base ">
                        {exchange.french}
                      </p>
                      <p className="text-xs text-gray-700">
                        {exchange.english}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`${
                        index % 2 === 0
                          ? "bg-sky-200 text-sky-900"
                          : "bg-purple-200 text-purple-900"
                      }`}
                    >
                      {exchange.speaker}
                    </Badge>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-6">
        <Button onClick={handleSaveScenario} className="px-6">
          {isLoading ? "Saving..." : "Save Conversation"}
        </Button>
      </div>
      <div>{error && <p className="text-red-600">{error}</p>}</div>
    </Card>
  );
}
