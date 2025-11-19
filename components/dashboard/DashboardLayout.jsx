"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { NotificationsPanel } from "./NotificationsPanel";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export default function DashboardLayout({ children }) {
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true); // For desktop sidebar
  const [isSheetSidebarOpen, setIsSheetSidebarOpen] = useState(false); // For mobile sheet sidebar
  const [showNotifications, setShowNotifications] = useState(false);
  const pathname = usePathname();



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
        <div className="flex-shrink-0">
          <Topbar
            sidebarOpen={isSheetSidebarOpen}
            setSidebarOpen={setIsSheetSidebarOpen}
            desktopSidebarOpen={isDesktopSidebarOpen}
            setDesktopSidebarOpen={setIsDesktopSidebarOpen}
            pathname={pathname}
            handleNotificationClick={() =>
              setShowNotifications(!showNotifications)
            }
          />
        </div>

        <ScrollArea className="w-full flex-1">
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
