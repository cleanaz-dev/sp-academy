"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@clerk/nextjs";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { NotificationsPanel } from "./NotificationsPanel";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const { isLoaded } = useUser();
  const pathname = usePathname();

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="w-screen h-screen flex overflow-hidden">
      {/* Sidebar for large screens */}
      <div
        className={`${
          sidebarOpen ? "w-48" : "w-0"
        } bg-white flex-shrink-0 h-full transition-[width] duration-300 overflow-hidden hidden lg:block`}
      >
        <div
          className={`h-full w-48 overflow-y-auto ${
            sidebarOpen ? "opacity-100" : "opacity-0"
          } transition-opacity duration-300`}
        >
          <Sidebar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            pathname={pathname}
          />
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-col flex-grow h-full transition-all duration-300 w-full lg:w-[calc(100%-15rem)]">
        <Topbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          pathname={pathname}
          handleNotificationClick={() => setShowNotifications(!showNotifications)}
        />

        <ScrollArea className="h-full w-full">
          <div className="flex-grow h-full bg-white overflow-auto">
            {children}
          </div>
        </ScrollArea>
      </div>

      {/* Notifications Overlay */}
      <NotificationsPanel
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
      />
    </div>
  );
}