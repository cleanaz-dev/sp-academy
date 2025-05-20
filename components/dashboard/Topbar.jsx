"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MenuDots } from "solar-icon-set";
import { Bell } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { navItems } from "./NavLinks";
import { Button } from "../ui/button";
import { useUser } from "@clerk/nextjs";
import { getReadNotificationsByUserId } from "@/lib/actions";
import { PanelLeftOpen,PanelRightOpen } from "lucide-react";
import { PanelLeftClose } from "lucide-react";

export const Topbar = ({
  sidebarOpen,
  setSidebarOpen,
  pathname,
  handleNotificationClick,
  desktopSidebarOpen,
  setDesktopSidebarOpen,
}) => {
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false); // Track if there are unread notifications
  const { user } = useUser();

  useEffect(() => {
    // Fetch unread notifications when the user changes or the component mounts
    const fetchUnreadNotifications = async () => {
      try {
        if (user?.id) {
          const unreadCount = await getReadNotificationsByUserId(user.id);
          setHasUnreadNotifications(unreadCount > 0); // Update state if there are unread notifications
        }
      } catch (error) {
        console.error("Error fetching unread notifications:", error);
      }
    };

    fetchUnreadNotifications();
  }, [user?.id]);

  return (
    <div className="flex h-[55px] w-full items-center justify-between px-4">
      <div className="flex items-center">
        {/* Logo for small screens */}
        <div className="-ml-3 flex items-center gap-2 text-white">
          {!desktopSidebarOpen && (
            <Link href="/home">
              <Image
                src="/logo1.png"
                height={100}
                width={100}
                alt="logo"
                priority
                style={{ width: "auto", height: "auto" }}
                className="ml-2"
              />
            </Link>
          )}
        </div>

        {/* MenuDots should always be visible */}

        <div className="mt-2 hidden lg:block">
          <button
            className="ml-2 mt-1 text-slate-800"
            onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
          >
            {!desktopSidebarOpen ? (
              <PanelLeftOpen
                className="mb-1 animate-pulse text-blue-400/80"
                strokeWidth={1.5}
              />
            ) : (
              <PanelLeftClose
                className="mb-1 animate-pulse text-blue-400/80"
                strokeWidth={1.5}
              />
            )}
          </button>
        </div>

        <div className="mt-2 block lg:hidden">
          <button
            className="ml-2 mt-1 text-slate-800"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {!desktopSidebarOpen ? (
              <PanelLeftOpen
                className="mb-1 animate-pulse text-blue-400/80"
                strokeWidth={1.5}
              />
            ) : (
              <PanelLeftClose
                className="mb-1 animate-pulse text-blue-400/80"
                strokeWidth={1.5}
              />
            )}
          </button>
        </div>

        {/* Top Menu Bar for larger screens */}
        <div className="ml-4 hidden cursor-pointer gap-4 text-slate-500 md:flex">
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`rounded-md px-2 py-1 text-sm ${
                pathname.includes(item.href)
                  ? "bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 font-semibold text-white"
                  : "text-blue-500"
              } hover:bg-gradient-to-r hover:from-green-300 hover:via-amber-300 hover:to-purple-300 hover:text-white`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="relative flex items-center gap-2">
        {/* Notification Button with Ping Circle */}
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={handleNotificationClick}
          className="relative"
        >
          <Bell className="size-5" strokeWidth={1.5} />
          {/* Ping Circle */}
          {hasUnreadNotifications && (
            <span className="absolute right-0 top-0 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
            </span>
          )}
        </Button>

        <UserButton />
      </div>
    </div>
  );
};
