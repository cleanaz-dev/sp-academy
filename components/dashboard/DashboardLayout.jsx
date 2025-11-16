"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { ScrollArea } from "@/components/old-ui/scroll-area";
import { useUser } from "@clerk/nextjs";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { NotificationsPanel } from "./NotificationsPanel";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/old-ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export default function DashboardLayout({ children }) {
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true); // For desktop sidebar
  const [isSheetSidebarOpen, setIsSheetSidebarOpen] = useState(false); // For mobile sheet sidebar
  const [showNotifications, setShowNotifications] = useState(false);
  const { isLoaded } = useUser();
  const pathname = usePathname();

  // Show loading until everything is ready
  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Sidebar for large screens */}
      <div
        className={`hidden lg:block ${
          isDesktopSidebarOpen ? "w-48" : "w-0"
        } h-full flex-shrink-0 bg-white transition-all duration-300`}
      >
        <Sidebar
          sidebarOpen={isDesktopSidebarOpen}
          setSidebarOpen={setIsDesktopSidebarOpen}
          pathname={pathname}
        />
      </div>

      {/* Sheet for small/medium screens */}
      <Sheet open={isSheetSidebarOpen} onOpenChange={setIsSheetSidebarOpen}>
        <SheetContent side="left" className="w-48 bg-white p-0 lg:hidden">
          <VisuallyHidden>
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>Menu</SheetDescription>
          </VisuallyHidden>
          <Sidebar
            sidebarOpen={isSheetSidebarOpen}
            setSidebarOpen={setIsSheetSidebarOpen}
            pathname={pathname}
          />
        </SheetContent>
      </Sheet>

      {/* Main content area */}
      <div
        className={`flex h-full w-full flex-grow flex-col transition-all duration-300 ${
          isDesktopSidebarOpen ? "lg:w-[calc(100%-12rem)]" : "lg:w-full"
        }`}
      >
        <Topbar
          sidebarOpen={isSheetSidebarOpen} // Mobile toggle affects sheet
          setSidebarOpen={setIsSheetSidebarOpen} // Mobile toggle updates sheet state
          desktopSidebarOpen={isDesktopSidebarOpen} // Pass desktop state to Topbar
          setDesktopSidebarOpen={setIsDesktopSidebarOpen} // Pass setter for desktop
          pathname={pathname}
          handleNotificationClick={() =>
            setShowNotifications(!showNotifications)
          }
        />

        <ScrollArea className="h-full w-full">
          <div className="h-full flex-grow overflow-auto bg-white">
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
