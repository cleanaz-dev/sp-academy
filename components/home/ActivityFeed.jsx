"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { format, formatDistanceToNow } from "date-fns";
import { Heart } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

// Helper functions
const getUserFromActivity = (item) => {
  if ("pagesRead" in item) return item.book.user;
  if ("achievement" in item) return item.user;
  if ("course" in item) return item.user;
  if ("lesson" in item) return item.user;
  if ("title" in item) return item.user;
  return item.user;
};

const getActivityTypeContent = (item) => {
  const activityTypes = {
    ReadingLog: () => ({
      type: "reading",
      image: item.book.coverUrl,
      title: item.book.title,
      subtitle: `Read`,
      pagesRead: item.pagesRead,
      author: item.book.author,
      imageSize: "book",
    }),
    Achievements: () => ({
      type: "achievement",
      image: item.achievement.imageUrl,
      title: item.achievement.name,
      subtitle: "Unlocked achievement:",
      description: item.achievement.description,
      imageSize: "square",
    }),
    CourseEnrollment: () => ({
      type: "course",
      image: item.course.coverUrl,
      title: item.course.title,
      subtitle: "Enrolled in course:",
      description: item.course.description,
      imageSize: "square",
    }),
    CompletedLesson: () => ({
      type: "lesson",
      image: item.lesson.course.coverUrl,
      title: item.lesson.title,
      subtitle: "Completed lesson:",
      courseName: item.lesson.course.title,
      imageSize: "square",
    }),
    CompletedBook: () => ({
      type: "book",
      image: item.coverUrl,
      title: item.title,
      subtitle: "Completed reading:",
      author: item.author,
      imageSize: "book",
    }),
    Conversations: () => ({
      type: "conversation",
      image: item.conversation.imageUrl,
      title: item.conversation.title,
      subtitle: "Had a conversation:",
      tutorLanguage: item.conversation.tutorLanguage,
      level: item.conversation.level,
      imageSize: "square",
    }),
  };

  const getContent = activityTypes[item.type];
  return getContent ? getContent() : null;
};

// Avatar Component
const Avatar = ({ user }) => {
  const userName = user.AccountSettings?.displayName || user.name;
  const avatarUrl = user.AccountSettings?.avatarUrl;

  return (
    <div className="group flex items-center gap-3">
      {avatarUrl ? (
        <div className="relative">
          <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 blur transition duration-300 group-hover:opacity-15"></div>
          <Image
            src={avatarUrl}
            alt={userName}
            width={40}
            height={40}
            className="transform rounded-full border-2 border-white shadow-sm transition-all duration-300 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="flex h-10 w-10 transform items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-purple-100 font-semibold text-gray-700 shadow-sm transition-all duration-300 group-hover:scale-105">
          {userName?.[0] || "?"}
        </div>
      )}
    </div>
  );
};

// ActivityImage component
const ActivityImage = ({ src, alt, content }) => {
  if (!src) return null;

  const getImageDimensions = () => {
    switch (content.imageSize) {
      case "book":
        return {
          width: 60,
          height: 90,
          className:
            "rounded-lg shadow-md hover:shadow-xl transform group-hover:scale-105 transition-all duration-300 w-auto h-auto",
        };
      case "square":
        return {
          width: 60,
          height: 60,
          className:
            "rounded-lg shadow-md hover:shadow-xl transform group-hover:scale-105 transition-all duration-300",
        };
      default:
        return {
          width: 60,
          height: 60,
          className:
            "rounded-lg shadow-md hover:shadow-xl transform group-hover:scale-105 transition-all duration-300",
        };
    }
  };

  const dimensions = getImageDimensions();

  return (
    <div className="group relative">
      <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 blur transition duration-300 group-hover:opacity-15"></div>
      <Image src={src} alt={alt} {...dimensions} />
    </div>
  );
};

// Like Button Component
const LikeButton = ({ item }) => {
  const [liked, setLiked] = useState(item.liked || false);
  const [likes, setLikes] = useState(item.likes || 0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleLike = async () => {
    setIsAnimating(true);
    const newLiked = !liked;
    const newLikes = newLiked ? likes + 1 : likes - 1;

    setLiked(newLiked);
    setLikes(newLikes);
    console.log("item", item);
    try {
      // Determine the userId based on whether item.book exists
      const userId = item.book?.user.id ?? item.user.id;

      const response = await fetch(`/api/shared-activity/like`, {
        method: "POST",
        body: JSON.stringify({
          id: item.id,
          liked: newLiked,
          type: item.type,
          targetUserId: item.userId,
          item: item,
          userId: userId,
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to update like");

      const data = await response.json();
      setLikes(data.likes);
    } catch (error) {
      console.error("Error liking activity:", error);
      setLiked(!newLiked);
      setLikes(likes);
    } finally {
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  return (
    <button
      onClick={handleLike}
      className="group flex items-center gap-1.5 text-gray-500 transition-colors duration-300 hover:text-red-500"
    >
      <Heart
        className={`h-5 w-5 transition-all duration-300 ${
          liked
            ? "fill-red-500 stroke-red-500"
            : "stroke-gray-500 group-hover:stroke-red-500"
        } ${isAnimating ? "scale-125" : "scale-100"}`}
      />
      <span className="text-sm font-medium">{likes}</span>
    </button>
  );
};

// Activity Content Component
const ActivityContent = ({ content }) => {
  if (!content) return null;

  return (
    <div className="mt-4 flex items-center gap-5">
      <ActivityImage
        src={content.image}
        alt={content.title}
        content={content}
      />
      <div className="flex-1">
        <p className="text-sm leading-relaxed text-gray-700">
          {content.subtitle}{" "}
          {content.pagesRead && (
            <>
              <span className="font-semibold text-blue-600">
                {content.pagesRead} pages
              </span>{" "}
              from
            </>
          )}
        </p>
        <p className="mt-1 text-lg font-semibold text-gray-800">
          "{content.title}"
        </p>
        {content.author && (
          <p className="mt-1 text-sm text-gray-500">by {content.author}</p>
        )}
        {content.description && (
          <p className="mt-1 text-sm text-gray-500">{content.description}</p>
        )}
        {content.courseName && (
          <p className="mt-1 text-sm text-gray-600">
            in course: {content.courseName}
          </p>
        )}
        {(content.tutorLanguage || content.level) && (
          <div className="mt-2 flex gap-2">
            {content.tutorLanguage && (
              <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600">
                {content.tutorLanguage}
              </span>
            )}
            {content.level && (
              <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-600">
                {content.level}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Activity Item Component
const ActivityItem = ({ item }) => {
  const timeAgo = formatDistanceToNow(new Date(item.createdAt), {
    addSuffix: true,
  });
  const user = getUserFromActivity(item);
  const content = getActivityTypeContent(item);

  return (
    <div className="rounded-xl bg-white p-4 transition-all duration-300 hover:bg-gray-50">
      <div className="flex items-center space-x-3">
        <Avatar user={user} />
        <p className="text-sm font-medium text-gray-700">{user.name}</p>
      </div>

      <ActivityContent content={content} />

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
        <p className="text-xs text-gray-500">{timeAgo}</p>
        <div className="transform transition-transform duration-300 hover:scale-105">
          <LikeButton item={item} />
        </div>
      </div>
    </div>
  );
};

// Loading skeleton
const ActivitySkeleton = () => (
  <div className="animate-pulse rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
    <div className="flex items-center space-x-3">
      <div className="h-10 w-10 rounded-full bg-gray-200" />
      <div className="space-y-2">
        <div className="h-4 w-24 rounded bg-gray-200" />
        <div className="h-3 w-16 rounded bg-gray-200" />
      </div>
    </div>
    <div className="mt-4 flex gap-5">
      <div className="h-[90px] w-[60px] rounded-lg bg-gray-200" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 rounded bg-gray-200" />
        <div className="h-6 w-full rounded bg-gray-200" />
        <div className="h-4 w-1/2 rounded bg-gray-200" />
      </div>
    </div>
  </div>
);

// Main Activity Feed Component
const ActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActivities = async () => {
    try {
      const response = await fetch("/api/shared-activity");
      if (!response.ok) throw new Error("Failed to fetch activities");

      const data = await response.json();

      // Debug log to check the raw data
      // console.log('Raw API response:', data);

      const combined = [
        ...data.readingLogs.map((item) => ({
          ...item,
          type: "ReadingLog",
          typeName: "Reading Log",
        })),
        ...data.conversations.map((item) => ({
          ...item,
          type: "Conversations",
          typeName: "Conversations",
        })),
        ...data.achievements.map((item) => ({
          ...item,
          type: "Achievements",
          typeName: "Achievements",
        })),
        ...data.enrollments.map((item) => ({
          ...item,
          type: "CourseEnrollment",
          typeName: "Course Enrollment",
        })),
        ...data.completedLessons.map((item) => ({
          ...item,
          type: "CompletedLesson",
          typeName: "Completed Lesson",
        })),
        ...data.completedBooks.map((item) => ({
          ...item,
          type: "CompletedBook",
          typeName: "Completed Book",
        })),
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Debug log to check the combined and transformed data
      // console.log('Combined activities:', combined);

      setActivities(combined);
    } catch (err) {
      console.error("Error fetching activities:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  if (loading)
    return (
      <div className="space-y-4">
        <ActivitySkeleton />
        <ActivitySkeleton />
        <ActivitySkeleton />
      </div>
    );

  if (error)
    return (
      <div className="rounded-lg bg-red-100 p-4 text-red-600">
        Error: {error}
      </div>
    );

  return (
    <div className="space-y-4">
      <ScrollArea className="h-[600px]">
        {activities.map((activity, index) => (
          <ActivityItem
            key={`${activity.id}-${index}`}
            item={activity}
            className="rounded-xl transition-all duration-300 hover:bg-gray-50"
          />
        ))}
      </ScrollArea>
    </div>
  );
};

export default ActivityFeed;
