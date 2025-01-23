"use client";

// import { UserButton } from "@clerk/nextjs";
import React, { useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  DoubleAltArrowLeft,
  PhoneCalling,
  MaskHapply,
  ChartSquare,
  Settings,
  UserCheck,
  MenuDots,
  Home2,
  MedalRibbonStar,
  Document,
  CalendarDate,
  History2,
  Sun2,
  StickerSmileCircle2,
  Book,
  Bookmark,
  BookmarkCircle,
  UserSpeak
} from "solar-icon-set";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import { DM_Serif_Display } from "next/font/google";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { DynaPuff } from "next/font/google"

const dynaPuff = DynaPuff({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
});
const navItems = [
  {
    label: "Home",
    href: "/home",
    icon: (
      <Home2
        size={24}
        iconStyle="BoldDuotone"
        svgProps={{ width: "24px", height: "24px" }}
      />
    ),
  },
  {
    label: "Lessons",
    href: "/lessons",
    icon: (
      <Sun2
        size={24}
        iconStyle="BoldDuotone"
        svgProps={{ width: "24px", height: "24px" }}
      />
    ),
  },
  //  {
  //   label: "Schedule",
  //   href: "/schedule",
  //   icon: (
  //    <CalendarDate
  //     size={24}
  //     iconStyle="BoldDuotone"
  //     svgProps={{ width: "24px", height: "24px" }}
  //    />
  //   ),
  //  },
  {
    label: "Conversation",
    href: "/conversation",
    icon: (
      <UserSpeak
        size={24}
        iconStyle="BoldDuotone"
        svgProps={{ width: "24px", height: "24px" }}
      />
    ),
  },
  //  {
  //   label: "Chat",
  //   href: "/chat",
  //   icon: <ChatDots size={24} iconStyle="BoldDuotone" />,
  //  },
  //  {
  //   label: "Achievements",
  //   href: "/achievements",
  //   icon: (
  //    <MedalRibbonStar
  //     size={24}
  //     iconStyle="BoldDuotone"
  //     svgProps={{ width: "24px", height: "24px" }}
  //    />
  //   ),
  //  },
  {
    label: "Short Story",
    href: "/short-story",
    icon: (
      <StickerSmileCircle2
        size={24}
        iconStyle="BoldDuotone"
        svgProps={{ width: "24px", height: "24px" }}
      />
    ),
  },
  {
    label: "Books",
    href: "/books",
    icon: (
      <MaskHapply
        size={24}
        iconStyle="BoldDuotone"
        svgProps={{ width: "24px", height: "24px" }}
      />
    ),
  },
];

const settingItems = [
  {
    label: "Account Settings",
    href: "/account-settings",
    icon: (
      <Settings
        size={24}
        iconStyle="BoldDuotone"
        svgProps={{ width: "24px", height: "24px" }}
      />
    ),
  },
  {
    label: "Profile",
    href: "/profile",
    icon: (
      <UserCheck
        size={24}
        iconStyle="BoldDuotone"
        svgProps={{ width: "24px", height: "24px" }}
      />
    ),
  },
];

const barNavItems = [...navItems];

const SidebarContent = ({
  sidebarOpen,
  setSidebarOpen,
  pathname,
  notifications,
}) => (
  <div className="flex flex-col h-full relative z-10">
    <div className="absolute right-0 top-0 h-full w-[1px] bg-gradient-to-r from-amber-400 via-purple-500 to-pink-500 blur- bg-[length:300%_300%] animate-[gradient_6s_ease_infinite] z-0 opacity-20"></div>

    <div className="flex px-4 py-2 items-center justify-between">
      <div className="flex gap-2 items-center text-white">
        <Image
          src="/logo1.png"
          height={100}
          width={100}
          alt="logo"
          priority
          style={{ width: "auto", height: "auto" }}
          className="-ml-2"
        />
      </div>
      <div
        className="text-blue-500 hover:animate-pulse cursor-pointer hidden lg:block"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <DoubleAltArrowLeft
          size={20}
          className="m-1"
          svgProps={{ width: "24px", height: "24px" }}
        />
      </div>
    </div>
    <div className="flex-grow overflow-y-auto space-y-2">
      {/* Sidebar Title */}
      <div className="flex gap-2 px-4 py-2 mb-2">
        <h1 className={`bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text text-xl font-bold tracking-wider ${dynaPuff.className}`}>
          Dashboard
        </h1>
      </div>
      {/* Sidebar Nav */}
      {navItems.map((navItem, index) => (
        <div className="px-2" key={index}>
          <Link
            href={navItem.href}
            className={`flex gap-4 items-center p-2 group rounded-sm 
            ${
              pathname.includes(navItem.href)
                ? "text-white bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400"
                : "text-blue-400"
            } 
            hover:bg-gradient-to-r hover:from-green-300 hover:via-amber-300 hover:to-purple-300 hover:text-white`}
          >
            {navItem.icon}
            <div
              className={`text-sm ${
                pathname.includes(navItem.href)
                  ? "text-white"
                  : "text-blue-500 group-hover:text-white"
              }`}
            >
              {navItem.label}
            </div>
          </Link>
        </div>
      ))}

      {/* Sidebar Title */}
      <div className="flex gap-2 px-4 py-2 mb-4 mt-4">
        <h1 className={`bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text text-xl font-bold tracking-widest ${dynaPuff.className}`}>
          Settings
        </h1>
      </div>
      {settingItems.map((settingItem, index) => (
        <div className="px-2" key={index}>
          <Link
            href={settingItem.href}
            className={`flex gap-4 items-center p-2 rounded-sm 
            ${
              settingItem.href === pathname
                ? "text-white bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400"
                : "text-blue-400"
            } 
            hover:bg-gradient-to-r hover:from-green-300 hover:via-amber-300 hover:to-purple-300 
            hover:text-white`}
          >
            {settingItem.icon}
            <span
              className={`text-sm ${
                settingItem.href === pathname
                  ? "text-white"
                  : "text-blue-500 group-hover:text-white"
              }`}
            >
              {settingItem.label}
            </span>
          </Link>
        </div>
      ))}
    </div>
  </div>
);


export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { isLoaded } = useUser();
  const pathname = usePathname();

  const handleMenuClick = () => {
    setSheetOpen(false); // Close the sheet
  };

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
          <SidebarContent
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            pathname={pathname}
          />
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-col flex-grow h-full transition-all duration-300 w-full lg:w-[calc(100%-15rem)]">
        {/* Topbar */}
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
              {/* Sheet for sidebar on small screens */}
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <button className="text-slate-800 ml-2 mt-2">
                    <MenuDots
                      className="animate-pulse"
                      iconStyle="BoldDuotone"
                      svgProps={{ width: "28px", height: "28px" }}
                    />
                  </button>
                </SheetTrigger>

                <SheetContent
                  side="left"
                  className="w-[200px] bg-white border-none p-0"
                  onClick={handleMenuClick}
                  aria-describedby={undefined}
                >
                  <SheetHeader>
                    <SheetTitle>
                      <p className="" alt="menu">
                        <span className="hidden">Menu</span>
                      </p>
                    </SheetTitle>
                  </SheetHeader>
                  <SidebarContent pathname={pathname} />
                </SheetContent>
              </Sheet>
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
              {barNavItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className={`text-sm rounded-md px-2 py-1 
        ${
          // Check if the current pathname includes the item.href
          pathname.includes(item.href)
            ? // Apply gradient background and white text for the active state
              "text-white bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 font-semibold"
            : // Default text color for non-active links
              "text-slate-500"
        } 
        // Gradient background and white text on hover
        hover:bg-gradient-to-r hover:from-green-300 hover:via-amber-300 hover:to-purple-300 hover:text-white`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex gap-2 items-center relative">
            <UserButton />
          </div>
        </div>

        {/* Main content */}
        <ScrollArea className="h-full w-full">
          {" "}
          {/* Ensure full height for ScrollArea */}
          <div className="flex-grow h-full  bg-white overflow-auto px-4">
            {children}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
