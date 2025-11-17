"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import { Medal } from "lucide-react";

export default function GameCard({ game, isLoading }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const scoreData = game.GameScore?.[0];

  // // Handle favorite toggle
  // const handleFavorite = () => {
  //   setIsFavorite((prev) => !prev);
  //   // TODO: Add API call to update favorite status
  // };

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-sm overflow-hidden rounded-lg bg-white shadow-lg">
        {/* Image Skeleton */}
        <Skeleton className="h-48 w-full" />

        {/* Content Skeleton */}
        <div className="p-6">
          <Skeleton className="mb-2 h-6 w-3/4" />
          <Skeleton className="mb-4 h-4 w-full" />
          <Skeleton className="mb-4 h-4 w-1/2" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="group max-w-sm overflow-hidden rounded-lg bg-white shadow-lg transition-shadow duration-300 hover:shadow-xl">
      {/* Game Image */}
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={game.imageUrl}
          alt={game.title}
          fill
          className="transform object-cover transition-transform duration-700 group-hover:scale-110"
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          style={{ objectPosition: "center" }}
        />
      </div>

      {/* Game Content */}
      <div className="p-6">
        {/* Title and Favorite Button */}
        <div className="flex items-center justify-between">
          <h2 className="mb-2 text-xl font-bold text-gray-900">{game.title}</h2>
          {/* <button
            onClick={handleFavorite}
            className="text-gray-400 hover:text-red-500 transition-colors duration-300"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
          </button> */}
        </div>

        {/* Description */}
        <p className="mb-4 line-clamp-2 text-sm text-gray-700">
          {game.description}
        </p>

        {/* Difficulty and Type */}
        <div className="mb-4 flex gap-2">
          <span className="rounded bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
            {game.difficulty === 1
              ? "Easy"
              : game.difficulty === 2
                ? "Medium"
                : "Hard"}
          </span>
          <span className="rounded bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
            {game.type}
          </span>
        </div>

        {/* Highest Score Section */}
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            {/* Trophy Icon */}
            <Medal
              strokeWidth={1.5}
              className="h-5 w-5 fill-yellow-100 text-yellow-500"
            />
            {/* Score Text */}
            <span className="text-sm text-muted-foreground">
              Highest Score: {scoreData?.score ?? "N/A"}
            </span>
          </div>
          {/* User Avatar */}
          <Avatar>
            <AvatarImage
              src={scoreData?.user?.AccountSettings?.avatarUrl}
              alt={scoreData?.user?.AccountSettings?.name}
            />
            <AvatarFallback className="rounded-full">U</AvatarFallback>
          </Avatar>
        </div>

        {/* Play Button */}
        <Link href={`/games/${game.id}`}>
          <Button className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors duration-300 hover:bg-blue-700">
            Play Game
          </Button>
        </Link>
      </div>
    </div>
  );
}
