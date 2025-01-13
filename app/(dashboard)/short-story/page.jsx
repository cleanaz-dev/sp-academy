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
import Image from "next/image";

export default async function Home() {
  const stories = await getAllShortStories();

  return (
    <main className="mx-auto">
      <header className="mb-4">
        <h1 className="header-title">Short Story</h1>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-6">
        {stories.map((story) => (
          <Card key={story.id} className="flex-col gap-4 short-story-svg-bg">
            <CardHeader>
              <CardTitle>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">{story.title}</span>
                  {story.imageUrl && (
                    <Image
                      src={story.imageUrl}
                      alt={story.title}
                      width={150}
                      height={150}
                      className="pb-4"
                    />
                  )}
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="w-fit bg-sky-500 text-white"
                    >
                      {story.language}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="w-fit bg-emerald-500 text-white"
                    >
                      {story.difficulty}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="w-fit bg-pink-500 text-white"
                    >
                      {story.genre}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="w-fit bg-amber-500 text-white"
                    >
                      {story.grammar}
                    </Badge>
                  </div>
                </div>
              </CardTitle>
              <CardDescription>{story.teaser}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white border rounded text-gray-500 hidden">
                <p>Difficulty: {story.difficulty}</p>
                <p>Genre: {story.difficulty}</p>
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
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  );
}
