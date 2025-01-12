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
import { Badge } from "@/components/ui/badge";

export default async function Home() {
  const stories = await getAllShortStories();

  return (
    <main className="container mx-auto">
      <header className="mb-4">
        <h1 className="header-title">Short Stories</h1>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-6">
        {stories.map((story) => (
          <Card key={story.id} className="flex-col gap-4 short-story-svg-bg">
            <CardHeader>
              <CardTitle>
                <div className="flex flex-col">
                  <span className="text-lg font-bold">{story.title}</span>
                  <Badge variant="outline" className="w-fit">
                    {story.language}
                  </Badge>
                </div>
              </CardTitle>
              <CardDescription>What will Sophie discover on her exciting trip to the zoo?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white border p-2 rounded text-gray-500">
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
