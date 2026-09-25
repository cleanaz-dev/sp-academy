"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

// We will need to update this Sidebar component next to use Shadcn's new sidebar structure
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { NotificationsPanel } from "./NotificationsPanel";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const pathname = usePathname();

  return (
    // SidebarProvider handles the open/close state globally for both desktop and mobile
    <SidebarProvider>
      {/* 1. The App Sidebar (handles both desktop and mobile sheet automatically) */}
      <Sidebar pathname={pathname} />

      {/* 2. Main Content Area */}
      <div className="flex h-screen w-full flex-col overflow-hidden bg-white">
        {/* Topbar Container: Visible ONLY on mobile/tablet (lg:hidden) */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 lg:hidden">
          {/* Built-in Shadcn trigger for the mobile sidebar sheet */}
          <SidebarTrigger className="-ml-1" />
        </header>

        {/* 3. Scrollable Page Content */}
        <ScrollArea className="h-full w-full flex-1">
          <main className="h-full w-full p-4 md:p-6">{children}</main>
        </ScrollArea>
      </div>

      {/* Notifications Overlay */}
      <NotificationsPanel
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
      />
    </SidebarProvider>
  );
}
