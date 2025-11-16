"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/old-ui/button";
import { Input } from "@/components/old-ui/input";
import { Label } from "@/components/old-ui/label";
import { Textarea } from "@/components/old-ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/old-ui/select";
import { getLimitedGameData } from "@/lib/actions";

const GameForm = ({ handleGeneratePreview, isLoading }) => {
  const [mode, setMode] = useState("new-game"); // "new-game" or "new-variation"
  const [title, setTitle] = useState("Grammar Detective!");
  const [theme, setTheme] = useState("People Doing Fun Things");
  const [description, setDescription] = useState(
    "Test your French grammar skills! Identify and correct common mistakes in a fun and educational way.",
  );
  const [rules, setRules] = useState(
    `Correct the sentences by choosing the right version.
    Earn 10 points for each correct answer.
    Bonus for streaks of correct answers.
    Time limit: 60 seconds.`,
  );
  const [language, setLanguage] = useState("French");
  const [gameType, setGameType] = useState("Grammar");
  const [difficulty, setDifficulty] = useState("1");
  const [slug, setSlug] = useState("");
  const [existingGames, setExistingGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState("");
  const [variationName, setVariationName] = useState("");
  console.log("selectedGame:", selectedGame);

  // useEffect to fetch existing games using the getLimitedGameData action
  useEffect(() => {
    getLimitedGameData()
      .then((data) => setExistingGames(data))
      .catch((error) => console.error("Error fetching existing games:", error));
  }, []);

  useEffect(() => {
    if (mode === "new-game") {
      setSlug(generateSlug(title));
    } else if (mode === "new-variation" && selectedGame) {
      // Directly use selectedGame as the slug when in new-variation mode
      setSlug(generateSlug(selectedGame));
    }
  }, [title, mode, selectedGame]);

  function generateSlug(title) {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload =
      mode === "new-game"
        ? {
            title,
            theme,
            description,
            rules,
            language,
            gameType,
            difficulty,
            slug,
          }
        : {
            // Find the game object from existingGames array and get its ID
            baseGameId: existingGames.find(
              (game) => game.title === selectedGame,
            )?.id,
            variationName,
            difficulty,
            language,
            theme,
            slug,
          };

    handleGeneratePreview(e, payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Mode Selector */}
      <div>
        <Label>What would you like to do?</Label>
        <Select value={mode} onValueChange={setMode}>
          <SelectTrigger>
            <SelectValue placeholder="Choose an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="new-game">Create New Game</SelectItem>
              <SelectItem value="new-variation">
                Create New Variation
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {mode === "new-variation" && (
        <>
          {/* Select Existing Game */}
          <div>
            <Label>Choose a Game</Label>
            <Select value={selectedGame} onValueChange={setSelectedGame}>
              <SelectTrigger>
                <SelectValue placeholder="Select an existing game" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {existingGames.map((game) => (
                    <SelectItem key={game.id} value={game.title}>
                      {game.title}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Variation Name */}
          <div>
            <Label>Variation Name</Label>
            <Input
              type="text"
              value={variationName}
              onChange={(e) => setVariationName(e.target.value)}
              placeholder="Enter variation name"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Slug */}
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={slug} disabled />
            </div>

            {/* Difficulty */}
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Language */}
            <div>
              <Label htmlFor="language">Language</Label>
              <Input
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              />
            </div>
            {/* Theme */}
            <div>
              <Label htmlFor="theme">Theme</Label>
              <Input
                id="theme"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              />
            </div>
          </div>
        </>
      )}

      {mode === "new-game" && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Title */}
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            {/* Slug */}
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={slug} disabled />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Language */}
            <div>
              <Label htmlFor="language">Language</Label>
              <Input
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              />
            </div>
            {/* Theme */}
            <div>
              <Label htmlFor="theme">Theme</Label>
              <Input
                id="theme"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Game Type */}
            <div>
              <Label htmlFor="gameType">Game Type</Label>
              <Select value={gameType} onValueChange={setGameType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select game type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="Verbal">Verbal</SelectItem>
                    <SelectItem value="Visual">Visual</SelectItem>
                    <SelectItem value="Grammar">Grammar</SelectItem>
                    <SelectItem value="Acoustic">Acoustic</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty */}
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Rules */}
          <div>
            <Label htmlFor="rules">Rules</Label>
            <Textarea
              id="rules"
              value={rules}
              onChange={(e) => setRules(e.target.value)}
            />
          </div>
        </>
      )}

      {/* Submit Button */}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Generating preview..." : "Generate Preview"}
      </Button>
    </form>
  );
};

export default GameForm;
