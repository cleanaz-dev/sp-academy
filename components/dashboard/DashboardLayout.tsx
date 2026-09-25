"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import { Sidebar } from "./Sidebar"; 
import { NotificationsPanel } from "./NotificationsPanel";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar pathname={pathname} />

      <div className="flex h-screen w-full flex-col overflow-hidden bg-white">
        
        {/* Mobile Header */}
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 lg:hidden">
          <SidebarTrigger className="-ml-1" />
          <span className="text-sm font-semibold text-slate-700">Dashboard</span>
        </header>

        <ScrollArea className="flex-1 w-full h-full">
          {/* REMOVED p-4 md:p-6 from here so your background goes edge-to-edge */}
          <main className="h-full w-full">
            {children}
          </main>
        </ScrollArea>
      </div>

      <NotificationsPanel
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
      />
    </SidebarProvider>
  );
}