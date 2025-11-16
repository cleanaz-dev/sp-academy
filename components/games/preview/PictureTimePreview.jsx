import React from "react";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PictureTimePreview({ gameData }) {
  // Helper function to ensure the URL starts with https://
  const ensureHttps = (url) => {
    if (!url.startsWith("https://") && !url.startsWith("http://")) {
      return `https://${url}`;
    }
    return url;
  };
  console.log("Game Data:", gameData);

  return (
    <div className="space-y-6">
      {gameData.game.map((question, index) => (
        <Card key={index} className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Question {index + 1}
            </CardTitle>
            <CardDescription>Choose the correct answer below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Image */}
            <div className="flex justify-center">
              <Image
                src={`https://${question.imageUrl[0]}`} // Ensure https://
                alt={`Visual prompt ${index}`}
                width={400}
                height={250}
                className="rounded-lg object-cover"
              />
            </div>

            {/* Choices */}
            <div className="grid grid-cols-2 gap-4">
              {question.choices.map((choice, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="h-12 w-full text-lg"
                  onClick={() => console.log(`Selected: ${choice}`)}
                >
                  {choice}
                </Button>
              ))}
            </div>

            {/* Correct Answer (for preview only) */}
            <div className="text-center font-medium text-green-600">
              Correct Answer: {question.answer}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
