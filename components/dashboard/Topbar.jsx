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

export const Topbar = ({
  sidebarOpen,
  setSidebarOpen,
  pathname,
  handleNotificationClick,
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
    <div className="h-[55px] w-full flex items-center px-4 justify-between">
      <div className="flex items-center">
        {/* Logo and menu for small screens */}
        <div className="flex lg:hidden -ml-3 gap-2 items-center text-white">
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
        </div>

        {/* Logo and menu for large screens */}
        {!sidebarOpen && (
          <div className="hidden lg:flex gap-2 items-center text-white">
            <Image
              src="/logo1.png"
              height={100}
              width={100}
              alt="logo"
              priority
              style={{ width: "auto", height: "auto" }}
              className="-ml-2"
            />
            {/* Menu to open sidebar */}
            <button
              className="text-slate-800 ml-2 mt-1"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <MenuDots
                className="animate-pulse"
                svgProps={{ width: "24px", height: "24px" }}
              />
            </button>
          </div>
        )}

        {/* Top Menu Bar */}
        <div className="gap-4 text-slate-500 cursor-pointer hidden md:flex ml-4">
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`text-sm rounded-md px-2 py-1 
              ${
                pathname.includes(item.href)
                  ? "text-white bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 font-semibold"
                  : "text-blue-500"
              } 
              hover:bg-gradient-to-r hover:from-green-300 hover:via-amber-300 hover:to-purple-300 hover:text-white`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex gap-2 items-center relative">
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
            <span className="absolute top-0 right-0 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
        </Button>

        <UserButton />
      </div>
    </div>
  );
};