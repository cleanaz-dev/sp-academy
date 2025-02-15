"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardTitle, CardDescription } from "../ui/card";
import { UserButton } from "@clerk/nextjs";
import { MessageCircle, ThumbsUp, Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { ScrollArea } from "../ui/scroll-area";

const notificationIcons = {
  message: <MessageCircle className="w-5 h-5" />,
  comment: <MessageCircle className="w-5 h-5" />,
  LIKE: <ThumbsUp className="w-5 h-5" />,
};

const NotificationItem = ({ notification, markAsRead }) => {
  const [isRead, setIsRead] = useState(notification.read);

  const handleClick = () => {
    if (!isRead) {
      console.log("notification id: ", notification.id);
      markAsRead(notification.id);
      setIsRead(true);
    }
    // Add your navigation logic here
  };

  return (
    <div
      className={cn(
        "px-4 py-3 cursor-pointer transition-colors my-2 rounded-lg ",
        "hover:bg-gray-50/80 active:bg-gray-100",
        !isRead && "bg-blue-50/50"
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3 px-3">
        {/* User Avatar
        <Avatar className="h-9 w-9">
          <AvatarImage src={notification.user?.avatarUrl} />
          <AvatarFallback>
            {notification.user?.name?.[0] || "U"}
          </AvatarFallback>
        </Avatar> */}

        <div className="flex-1 flex items-start justify-between gap-3">
          <div>
            {/* Title with uppercase for likes */}
            <CardTitle className="text-sm font-semibold text-gray-900 mb-1">
              {notification.activityTitle}
            </CardTitle>

            {/* Description */}
            <CardDescription className="text-sm text-gray-600 line-clamp-2">
              {notification.description}
            </CardDescription>

            {/* Date at bottom */}
            <div className="mt-2 text-xs text-gray-400">
              {formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
              })}
            </div>
          </div>

          {/* Notification Icon */}
          <div
            className={cn(
              "p-2 rounded-full flex-shrink-0",
              isRead ? "bg-gray-100" : "bg-blue-100"
            )}
          >
            {React.cloneElement(
              notificationIcons[notification.type] || (
                <Bell className="w-5 h-5" />
              ),
              {
                className: cn(
                  "w-5 h-5",
                  isRead
                    ? "text-gray-500"
                    : {
                        "text-blue-600": notification.type === "message",
                        "text-green-600": notification.type === "comment",
                        "text-blue-500": notification.type === "LIKE",
                        "text-gray-500": !notification.type,
                      }
                ),
              }
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationSkeleton = () => {
  return (
    <div className="px-4 py-3 border-b">
      <div className="flex items-start gap-3">
        <Skeleton className="w-9 h-9 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-[160px]" />
          <Skeleton className="h-3 w-[200px]" />
          <Skeleton className="h-3 w-[100px]" />
        </div>
        <Skeleton className="w-9 h-9 rounded-full" />
      </div>
    </div>
  );
};

export default function NotificationCard({handleNotificationClick}) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(
        `/api/shared-activity/notifications/${notificationId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to mark notification as read: ${response.status}`
        );
      }

      // Remove the notification from the list after marking it as read
      setNotifications((prev) =>
        prev.filter((n) => n.id !== notificationId)
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/shared-activity/notifications/read-all", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Failed to mark all as read: ${response.status}`);
      }

      // Clear all notifications after marking them as read
      setNotifications([]);
      handleNotificationClick(); 
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/shared-activity/notifications");
        const data = await response.json();
  
        // Filter out read notifications (optional, if backend doesn't filter)
        const unreadNotifications = data.filter((n) => !n.isRead);
  
        setNotifications(unreadNotifications);
      } finally {
        setLoading(false);
      }
    };
  
    fetchNotifications();
  }, []);

  return (
    <div className="flex flex-col rounded-lg shadow-lg">
      <div className="p-4 bg-gray-50">
        <h3 className="text-lg font-semibold">
          Notifications {notifications.length}
        </h3>
        <button
          onClick={markAllAsRead}
          className="text-sm text-blue-500 hover:text-blue-700"
        >
          Read All
        </button>
      </div>

      <ScrollArea className="h-dvh px-4 shadow-inner">
        {loading ? (
          Array(3)
            .fill(0)
            .map((_, i) => <NotificationSkeleton key={i} />)
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              markAsRead={markAsRead}
            />
          ))
        ) : (
          <div className="p-6 text-center text-gray-500 text-sm">
            No new notifications
          </div>
        )}
      </ScrollArea>
    </div>
  );
}