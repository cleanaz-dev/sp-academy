"use client";

// import { UserButton } from "@clerk/nextjs";
import React, { useState } from "react";
import Logo from "../public/logo.png";
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
 StickerSmileCircle2
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

const displayFont = DM_Serif_Display({
 subsets: ["latin"],
 weight: "400",
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
 {
  label: "Schedule",
  href: "/schedule",
  icon: (
   <CalendarDate
    size={24}
    iconStyle="BoldDuotone"
    svgProps={{ width: "24px", height: "24px" }}
   />
  ),
 },
 {
  label: "Journals",
  href: "/journals",
  icon: (
   <History2
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
 {
  label: "Achievements",
  href: "/achievements",
  icon: (
   <MedalRibbonStar
    size={24}
    iconStyle="BoldDuotone"
    svgProps={{ width: "24px", height: "24px" }}
   />
  ),
 },
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
 <div className="flex flex-col h-full">
  <div className="flex px-4 py-2 items-center justify-between">
   <div className="flex gap-2 items-center text-white">
    <Image
     src="/logo.png"
     height={25}
     width={25}
     alt="logo"
     priority
     style={{ width: "auto", height: "auto" }}
     className="-ml-4"
    />

    <h1 className="text-lg text-white font-bold whitespace-nowrap">
     <span className={displayFont.className}>SF Academy</span>
    </h1>
   </div>
   <div
    className="text-white hover:animate-pulse cursor-pointer hidden lg:block"
    onClick={() => setSidebarOpen(!sidebarOpen)}
   >
    <DoubleAltArrowLeft
     size={24}
     className="hover:bg-slate-600/50 rounded-lg m-1 "
     svgProps={{ width: "24px", height: "24px" }}
    />
   </div>
  </div>
  <div className="flex-grow overflow-y-auto space-y-2">
   {/* Sidebar Title */}
   <div className="flex gap-3 px-4 py-2 bg-blue-600/20 mb-4">
    <h1 className="text-xl text-white font-bold">Dashboard</h1>
   </div>
   {/* Sidebar Nav */}
   {navItems.map((navItem, index) => (
    <div className="px-2" key={index}>
     <Link
      href={navItem.href}
      className={`flex gap-4 items-center p-2 group hover:bg-yellow-300 hover:text-white rounded-sm ${
       pathname.includes(navItem.href)
        ? "text-white bg-blue-400/60"
        : "text-blue-400"
      }`}
     >
      {navItem.icon}
      <div className="text-sm text-white ">{navItem.label}</div>
     </Link>
    </div>
   ))}
   {/* Sidebar Title */}
   <div className="flex gap-2 px-4 py-2 bg-blue-600/20 mb-4 mt-4">
    <h1 className="text-xl text-white font-bold">Settings</h1>
   </div>
   {settingItems.map((settingItem, index) => (
    <div className="px-2" key={index}>
     <Link
      href={settingItem.href}
      className={`flex gap-4 items-center p-2 hover:bg-yellow-300 hover:text-white rounded-sm ${
       settingItem.href === pathname
        ? "text-white bg-blue-400/60"
        : "text-blue-400"
      }`}
     >
      {settingItem.icon}
      <span className="text-sm text-white">{settingItem.label}</span>
     </Link>
    </div>
   ))}
  </div>
 </div>
);

export default function DashboardLayout({ children }) {
 const [sidebarOpen, setSidebarOpen] = useState(true);
 const [sheetOpen, setSheetOpen] = useState(false);
 const { isLoaded, user } = useUser();
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
    } bg-gradient-to-b from-indigo-200 to-yellow-100 flex-shrink-0 h-full transition-[width] duration-300 overflow-hidden hidden lg:block`}
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
    <div className="h-[55px] bg-gradient-to-r from-indigo-200 to-yellow-100 w-full flex items-center px-4 justify-between">
     <div className="flex items-center">
      {/* Logo and menu for small screens */}
      <div className="flex lg:hidden -ml-3 gap-2 items-center text-white">
       <Image
        src="/logo.png"
        height={25}
        width={25}
        alt="logo"
        priority
        style={{ width: "auto", height: "auto" }}
       />
       <h1 className="text-lg text-white font-bold whitespace-nowrap">
        <span className={displayFont.className}>SF Academy</span>
       </h1>
       {/* Sheet for sidebar on small screens */}
       <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
         <button className="text-white ml-2 mt-2">
          <MenuDots
           className="animate-pulse"
           iconStyle="BoldDuotone"
           svgProps={{ width: "28px", height: "28px" }}
          />
         </button>
        </SheetTrigger>

        <SheetContent
         side="left"
         className="w-[200px] bg-gradient-to-b from-indigo-200 to-yellow-100 border-none p-0"
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
         src="/logo.png"
         height={25}
         width={25}
         alt="logo"
         priority
         style={{ width: "auto", height: "auto" }}
         className="-ml-4"
        />
        <h1 className="text-lg text-white font-bold whitespace-nowrap">
         <span className={displayFont.className}>SF Academy</span>
        </h1>
        {/* Menu to open sidebar */}
        <button
         className="text-white ml-2 mt-1"
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
         className={`text-sm hover:underline hover:underline-offset-4 ${
          pathname.includes(item.href)
           ? "text-white font-semibold underline"
           : "text-slate-500"
         }`}
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
