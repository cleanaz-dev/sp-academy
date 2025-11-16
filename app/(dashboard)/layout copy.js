"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Short_Stack, Anton } from "next/font/google";
import Image from "next/image";
import { UserButton, useUser } from "@clerk/nextjs";
import { BookAudioIcon, BookCheck } from "lucide-react";
import {
  Calendar,
  Settings2Icon,
  PanelRight,
  BookOpen,
  LayoutDashboard,
  BookHeartIcon,
  Star,
} from "lucide-react";
import { Button } from "@/components/old-ui/button";

const shortStack = Short_Stack({
  subsets: ["latin"],
  weight: "400",
});
const anton = Anton({
  subsets: ["latin"],
  weight: "400",
});

const sidebarItems = [
  { name: "Dashboard", href: "/home", icon: <LayoutDashboard /> },
  { name: "Lessons", href: "/lessons", icon: <BookCheck /> },
  { name: "Schedule", href: "/schedule", icon: <Calendar /> },
  { name: "Journals", href: "/journals", icon: <BookHeartIcon /> },
  { name: "Achievments", href: "/achievements", icon: <Star /> },
  { name: "Settings", href: "/settings", icon: <Settings2Icon /> },
  { name: "Short Story", href: "/short-story", icon: <BookAudioIcon /> },
];

function Sidebar({ sideBarOpen, toggleSideBar }) {
  const { user } = useUser();
  const pathname = usePathname();
  return (
    <div className="relative">
      <div
        className={`flex h-screen w-auto flex-col ${
          sideBarOpen ? "translate-x-0" : "-translate-x-60"
        } justify-between bg-gradient-to-b from-indigo-200 to-yellow-100 transition-transform duration-500`}
      >
        <div className="flex items-center gap-2 px-4 pt-6">
          <Link href="/home" className="flex items-center" prefetch={false}>
            <BookOpen
              size="40"
              className="rounded-xl border-2 border-blue-500 p-1 text-blue-500"
            />
            <p
              className={`${anton.className} mx-2 text-xl font-semibold tracking-widest text-slate-100`}
            >
              SP <span className="text-blue-500">Academy</span>
            </p>
          </Link>
          <button
            className="pb-0.5 transition-colors duration-300 hover:text-slate-50"
            onClick={toggleSideBar}
          >
            <PanelRight className="animate-pulse rounded text-slate-100 ring-1 hover:animate-none" />
          </button>
        </div>
        <div className="flex-1 gap-4 px-8 py-4">
          {sidebarItems.map((link, index) => (
            <Link href={link.href} key={index}>
              <div
                className={`mb-2 flex items-center gap-2 rounded-xl p-2 text-white transition-all duration-100 hover:translate-x-2 hover:bg-secondary hover:font-bold hover:text-blue-600 ${
                  pathname.startsWith(link.href)
                    ? "bg-secondary font-extrabold text-blue-500"
                    : ""
                }`}
              >
                <span
                  className={`${
                    pathname.startsWith(link.href) ? "text-blue-500" : ""
                  }`}
                >
                  {link.icon}
                </span>
                <p
                  className={`text-base ${
                    pathname.startsWith(link.href) ? "text-blue-500" : ""
                  }`}
                >
                  {link.name}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-auto flex items-center gap-2 px-8 py-4 transition-all duration-300 hover:bg-primary/10">
          <UserButton children /> {user?.firstName}
        </div>
      </div>
      {!sideBarOpen ? (
        <button
          className="absolute left-4 top-6 rounded-full bg-accent p-2 transition-colors duration-300 hover:bg-secondary"
          onClick={toggleSideBar}
        >
          <PanelRight />
        </button>
      ) : null}
    </div>
  );
}

export default function Layout({ children }) {
  const [sideBarOpen, setSideBarOpen] = useState(true);

  const toggleSideBar = () => {
    setSideBarOpen(!sideBarOpen);
  };

  return (
    <div className="flex h-screen">
      <Sidebar sideBarOpen={sideBarOpen} toggleSideBar={toggleSideBar} />
      <div
        className={`flex-1 transition-all duration-300 ${
          sideBarOpen ? "ml-0" : "-ml-40"
        } w-full`}
      >
        <span className={shortStack.className}>{children}</span>
      </div>
    </div>
  );
}
