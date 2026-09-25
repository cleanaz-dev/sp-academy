"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { navItems, settingItems } from "./NavLinks";
import { Button } from "@/components/ui/button";

// Import the new Shadcn Sidebar components
// We alias Sidebar to ShadcnSidebar to prevent naming conflicts with your component name
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

interface SidebarProps {
  pathname: string;
}

export const Sidebar = ({ pathname }: SidebarProps) => {
  const [isUserAdmin, setIsUserAdmin] = useState<boolean>(false);
  
  // Shadcn's hook replaces the need to pass open states manually
  const { state, isMobile } = useSidebar();
  const sidebarOpen = state === "expanded" || isMobile;

  useEffect(() => {
    const fetchIsAdmin = async () => {
      try {
        const response = await fetch("/api/users/is-admin");
        const data = await response.json();
        setIsUserAdmin(data.isAdmin);
      } catch (error) {
        console.error("Error fetching admin status:", error);
      }
    };

    fetchIsAdmin();
  }, []);

  return (
    <ShadcnSidebar>
      {/* 1. Header (Logo) */}
      <SidebarHeader className="mt-4 flex items-center justify-center">
        <Image
          src="/logo1.png"
          height={100}
          width={100}
          alt="logo"
          priority
          style={{ width: "auto", height: "auto" }}
          className="flex"
        />
      </SidebarHeader>

      {/* 2. Scrollable Content */}
      <SidebarContent>
        {/* Menu Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="py-4 text-lg font-bold tracking-widest text-emerald-500">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((navItem, index) => {
                const isActive = pathname.includes(navItem.href);
                return (
                  <SidebarMenuItem key={index} className="px-2 py-1">
                    <SidebarMenuButton
                 
                      isActive={isActive}
                      className={`group flex h-auto items-center gap-4 rounded-sm p-3 transition-all ${
                        isActive
                          ? "bg-linear-to-r from-blue-400 via-purple-400 to-indigo-400 text-white"
                          : "text-blue-400"
                      } hover:bg-linear-to-r hover:from-green-300 hover:via-amber-300 hover:to-purple-300 hover:text-white`}
                    >
                      <Link href={navItem.href}>
                        {navItem.icon}
                        <span
                          className={`text-xs ${
                            isActive
                              ? "text-white"
                              : "text-blue-500 group-hover:text-white"
                          }`}
                        >
                          {navItem.label}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="py-4 text-lg font-bold tracking-widest text-emerald-500">
            Settings
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingItems.map((settingItem, index) => {
                const isActive = pathname === settingItem.href; // Maintained your strict equality check for settings
                const isTextActive = pathname.includes(settingItem.href);

                return (
                  <SidebarMenuItem key={index} className="px-2 py-1">
                    <SidebarMenuButton
                
                      isActive={isActive}
                      className={`group flex h-auto items-center gap-4 rounded-sm p-3 transition-all ${
                        isActive
                          ? "bg-linear-to-r from-blue-400 via-purple-400 to-indigo-400 text-white"
                          : "text-blue-400"
                      } hover:bg-linear-to-r hover:from-green-300 hover:via-amber-300 hover:to-purple-300 hover:text-white`}
                    >
                      <Link href={settingItem.href}>
                        {settingItem.icon}
                        <span
                          className={`text-xs ${
                            isTextActive
                              ? "text-white"
                              : "text-blue-500 group-hover:text-white"
                          }`}
                        >
                          {settingItem.label}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* 3. Footer (Admin Button) */}
      {isUserAdmin && sidebarOpen && (
        <SidebarFooter className="p-4">
          <div className="animate-gradient overflow-hidden rounded-lg bg-linear-to-r from-sky-400 via-emerald-400 to-violet-400 bg-[length:300%_300%] p-1 shadow-lg">
            <Link href="/admin">
              <Button
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-transparent py-3 font-semibold text-white shadow-md transition-all hover:bg-black/10"
                variant="ghost"
              >
                <ShieldCheck className="h-5 w-5" />
                <span>Admin Center</span>
              </Button>
            </Link>
          </div>
        </SidebarFooter>
      )}
    </ShadcnSidebar>
  );
};