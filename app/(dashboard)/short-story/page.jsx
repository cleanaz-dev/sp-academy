//app/(dashboard)/short-story/page.jsx
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
import { BookOpenText } from "lucide-react";

export default async function Home() {
  const stories = await getAllShortStories();

  return (
    <main className="mx-auto">
      <header className="bg-gradient-to-r from-sky-400 via-emerald-400 to-violet-400 bg-[length:300%_300%] animate-[gradient_6s_ease_infinite] text-white py-16 mb-8">
        <div className="max-w-7xl mx-auto px-6">
        <h1 className="flex items-center gap-4 text-4xl font-bold mb-4">
            Short Stories <BookOpenText strokeWidth={1.5} className="size-10 drop-shadow-xl" />
          </h1>
          <p className="text-xl opacity-90">
            Immerse yourself in a world of enchanting stories, inspired by you.
          </p>
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
        {stories.map((story) => (
          <Card
            key={story.id}
            className="flex flex-col justify-between h-full shadow-md rounded-2xl overflow-hidden bg-white dark:bg-gray-800 hover:shadow-lg"
          >
            <div>
              <div className="relative h-48 w-full group overflow-hidden">
                {story.imageUrl && (
                  <Image
                    src={story.imageUrl}
                    alt={story.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>
              <CardHeader className="p-4">
                <CardTitle>
                  <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    {story.title}
                  </h2>
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                  {story.teaser}
                </CardDescription>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge className="bg-sky-500 text-white">
                    {story.language}
                  </Badge>
                  <Badge className="bg-emerald-500 text-white">
                    {story.difficulty}
                  </Badge>
                  <Badge className="bg-pink-500 text-white">
                    {story.genre}
                  </Badge>
                  <Badge className="bg-amber-500 text-white">
                    {story.grammar}
                  </Badge>
                </div>
              </CardHeader>
            </div>
            <CardFooter className="p-4 mt-auto">
              <Button
                asChild
                className="w-full bg-gradient-to-br from-blue-600 to-violet-600 hover:animate-pulse text-white font-medium rounded-md py-2"
              >
                <Link href={`/short-story/${story.id}`}>Read 🤓</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  );
}
