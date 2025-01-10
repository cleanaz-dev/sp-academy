import React from "react";
import { getAllShortStories } from "@/lib/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Home() {
  const stories = await getAllShortStories();

  return (
    <main className="container mx-auto">
      <h1 className="text-3xl font-bold text-center my-8">
        French Learning Stories
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-6">
        {stories.map((story) => (
          <Card
            key={story.id}
            className="flex-col gap-4 bg-gradient-to-b from-indigo-200/25 to-yellow-100/25"
          >
            <CardHeader>
              <CardTitle className="text-lg font-bold">{story.topic}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white/50 border p-2 rounded text-gray-500">
                <p>Difficulty: {story.difficulty}</p>
                <p>Genre: {story.genre}</p>
                <p>Grammar: {story.grammar}</p>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex-col space-y-2 w-full">
                <Button
                  asChild
                  className="w-full bg-gradient-to-br from-blue-600 to-violet-600 hover:animate-pulse"
                >
                  <Link href={`/short-story/${story.id}`}>Read 🤓</Link>
                </Button>
                <Button
                  asChild
                  className="w-full bg-gradient-to-br from-blue-600 to-violet-600 hover:bg-opacity-90"
                >
                  <Link
                    href={`/short-story/${story.id}`}
                    aria-label="Go to Pronunciation Practice story"
                  >
                    Practice 🤔
                  </Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  );
}
