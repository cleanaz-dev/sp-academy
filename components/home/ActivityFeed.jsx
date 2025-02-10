"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { format, formatDistanceToNow } from "date-fns";
import { Heart } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

function Avatar({ user }) {
  const userName = user.AccountSettings?.displayName || user.name;
  const avatarUrl = user.AccountSettings?.avatarUrl;

  return (
    <div className="flex items-center gap-3">
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={userName}
          width={40}
          height={40}
          className="rounded-full border border-gray-200"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold">
          {userName?.[0] || "?"}
        </div>
      )}
    </div>
  );
}

function LikeButton({ item }) {
  const [liked, setLiked] = useState(item.liked || false);
  const [likes, setLikes] = useState(item.likes || 0);

  const handleLike = async () => {
    const newLiked = !liked;
    const newLikes = newLiked ? likes + 1 : likes - 1;

    // Optimistically update UI
    setLiked(newLiked);
    setLikes(newLikes);

    try {
      const response = await fetch(`/api/shared-activity/like`, {
        method: "POST",
        body: JSON.stringify({ id: item.id, liked: newLiked, type: item.type }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to update like");
      }

      // (Optional) You could get the latest like count from the response and update state
      const data = await response.json();
      setLikes(data.likes); // Assuming the API returns the updated like count
    } catch (error) {
      console.error("Error liking activity:", error);
      // Rollback UI state in case of failure
      setLiked(!newLiked);
      setLikes(likes);
    }
  };

  return (
    <button
      onClick={handleLike}
      className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition"
    >
      <Heart
        className={`w-5 h-5 ${
          liked ? "fill-red-500 stroke-red-500" : "stroke-gray-500"
        }`}
      />
      <span className="text-sm">{likes}</span>
    </button>
  );
}


function ActivityItem({ item }) {
  const timeAgo = formatDistanceToNow(new Date(item.createdAt), {
    addSuffix: true,
  });

  return (
    <div className="bg-white hover:bg-gray-50 rounded-xl p-4 transition-all duration-300">
      {/* User section */}
      <div className="flex items-center space-x-3">
        <Avatar
          user={
            "pagesRead" in item
              ? item.book.user
              : "achievement" in item
              ? item.user
              : "course" in item
              ? item.user
              : "lesson" in item
              ? item.user
              : item.user
          }
        />
        <p className="text-sm font-medium text-gray-700">
          {("pagesRead" in item 
            ? item.book.user 
            : "course" in item
            ? item.user
            : "lesson" in item
            ? item.user
            : item.user).name}
        </p>
      </div>

      {/* Content section */}
      {"pagesRead" in item ? (
        <div className="mt-4 flex gap-5 items-center">
          {item.book.coverUrl && (
            <div className="relative group">
              <Image
                src={item.book.coverUrl}
                alt={item.book.title}
                width={60}
                height={90}
                className="rounded-lg shadow-sm transform group-hover:scale-105 transition-transform duration-300 w-auto h-auto"
              />
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm text-gray-700 leading-relaxed">
              Read{" "}
              <span className="font-semibold text-blue-600">
                {item.pagesRead} pages
              </span>{" "}
              from
            </p>
            <p className="font-semibold text-gray-800 text-lg mt-1">
              "{item.book.title}"
            </p>
            <p className="text-gray-500 text-sm mt-1">
              by {item.book.author}
            </p>
          </div>
        </div>
      ) : "achievement" in item ? (
        <div className="mt-4 flex gap-5 items-center">
          {item.achievement.imageUrl && (
            <div className="relative group">
              <Image
                src={item.achievement.imageUrl}
                alt={item.achievement.name}
                width={60}
                height={60}
                className="rounded-lg shadow-sm transform group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm text-gray-700">Unlocked achievement:</p>
            <p className="font-semibold text-gray-800 text-lg mt-1">
              "{item.achievement.name}"
            </p>
            <p className="text-gray-500 text-sm mt-1">
              {item.achievement.description}
            </p>
          </div>
        </div>
      ) : "course" in item ? (
        <div className="mt-4 flex gap-5 items-center">
          {item.course.coverUrl && (
            <div className="relative group">
              <Image
                src={item.course.coverUrl}
                alt={item.course.title}
                width={60}
                height={60}
                className="rounded-lg shadow-sm transform group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm text-gray-700">Enrolled in course:</p>
            <p className="font-semibold text-gray-800 text-lg mt-1">
              "{item.course.title}"
            </p>
       
            {item.course.description && (
              <p className="text-gray-500 text-sm mt-1">
                {item.course.description}
              </p>
            )}
          </div>
        </div>
      ) : "lesson" in item ? (
        <div className="mt-4 flex gap-5 items-center">
          <div className="flex-1">
            <p className="text-sm text-gray-700">Completed lesson:</p>
            <p className="font-semibold text-gray-800 text-lg mt-1">
              "{item.lesson.title}"
            </p>
            {item.lesson.course && (
              <p className="text-gray-600 text-sm mt-1">
                in course: {item.lesson.course.title}
              </p>
            )}
            {item.lesson.level && (
              <span className="px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium mt-2 inline-block">
                Level {item.lesson.level}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-4 flex gap-5 items-center">
          {item.conversation.imageUrl && (
            <div className="relative group">
              <Image
                src={item.conversation.imageUrl}
                alt={item.conversation.title}
                width={60}
                height={60}
                className="rounded-lg shadow-sm transform group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm text-gray-700">Had a conversation:</p>
            <p className="font-semibold text-gray-800 text-lg mt-1">
              "{item.conversation.title}"
            </p>
            {(item.conversation.tutorLanguage || item.conversation.level) && (
              <div className="flex gap-2 mt-2">
                {item.conversation.tutorLanguage && (
                  <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                    {item.conversation.tutorLanguage}
                  </span>
                )}
                {item.conversation.level && (
                  <span className="px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium">
                    {item.conversation.level}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer section */}
      <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500">{timeAgo}</p>
        <div className="transform hover:scale-105 transition-transform duration-300">
          <LikeButton item={item} />
        </div>
      </div>
    </div>
  );
}
export default function ActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchActivities() {
      try {
        const response = await fetch("/api/shared-activity");
        if (!response.ok) {
          throw new Error("Failed to fetch activities");
        }
        const data = await response.json();
        const combined = [
          ...data.readingLogs.map(item => ({ ...item, type: "ReadingLog" })),
          ...data.conversations.map(item => ({ ...item, type: "Conversations" })),
          ...data.achievements.map(item => ({ ...item, type: "Achievements" })),
          ...data.enrollments.map(item => ({ ...item, type: "CourseEnrollment" })),
          ...data.completedLessons.map(item => ({ ...item, type: "CompletedLesson" })),
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setActivities(combined);
      } catch (err) {
        console.error("Error fetching activities:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchActivities();
    const intervalId = setInterval(fetchActivities, 60000);
    return () => clearInterval(intervalId);
  }, []);

  if (loading) return <div className="text-center p-6">Loading...</div>;
  if (error)
    return (
      <div className="p-4 bg-red-100 text-red-600 rounded-lg">
        Error: {error}
      </div>
    );

  return (
    <div className="space-y-4">
      <ScrollArea className="h-[600px]">
        {activities.map((activity, index) => (
          <ActivityItem
            key={index}
            item={activity}
            className="hover:bg-gray-50 rounded-xl transition-all duration-300"
          />
        ))}
      </ScrollArea>
    </div>
  );
}
