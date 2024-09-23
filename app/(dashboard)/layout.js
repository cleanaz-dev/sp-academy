"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {Short_Stack, Anton} from 'next/font/google'
import Image from 'next/image'
import { UserButton, useUser  } from '@clerk/nextjs';
import { DashboardIcon, StarFilledIcon } from "@radix-ui/react-icons";
import { BookCheck } from "lucide-react";
import { Calendar } from "lucide-react";
import { Settings2Icon } from "lucide-react";
import { PhoneForwarded } from "lucide-react";
import { PanelRight } from "lucide-react";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { Star } from "lucide-react";
import { LayoutDashboard } from "lucide-react";
import { BookHeartIcon } from "lucide-react";



const shortStack = Short_Stack({ 
  subsets: ["latin"],
  weight: "400"
 });
const anton = Anton({
  subsets: ["latin"],
  weight: "400"
 
});

const sidebarItems = [
 { name: "Dashboard", href: "/home", icon: <LayoutDashboard/> },
 { name: "Lessons", href: "/lessons", icon: <BookCheck /> },
 { name: "Schedule", href: "/schedule", icon: <Calendar /> },
 { name:"Journals", href: "/journals", icon: <BookHeartIcon />},
 { name: "Achievments", href: "/achievements", icon: <Star /> },
 { name: "Settings", href: "/settings", icon: <Settings2Icon />}
];

function Sidebar({ sideBarOpen, toggleSideBar }) {
 const { user } = useUser();
 const pathname = usePathname();
 return (
  <div className="relative">
   <div
    className={`h-screen w-auto flex flex-col ${
     sideBarOpen ? "translate-x-0" : "-translate-x-60"
    } bg-gradient-to-b from-indigo-200 to-yellow-100 transition-transform duration-500 justify-between`}
   >
    <div className="flex pt-6 px-4 gap-2 items-center ">
     <Link href="/home" className="flex items-center " prefetch={false}>
      <BookOpen
       size="40"
       className="p-1 rounded-xl border-2 border-blue-500 text-blue-500 "
      />
      <p
       className={`${anton.className} text-xl font-semibold mx-2 tracking-widest text-slate-100`}
      >
       SP <span className="text-blue-500">Academy</span>
      </p>
     </Link>
     <button
      className="hover:text-slate-50 transition-colors duration-300 pb-0.5"
      onClick={toggleSideBar}
     >
      <PanelRight className="animate-pulse ring-1 rounded hover:animate-none text-slate-100" />
     </button>
    </div>
    <div className="flex-1 gap-4 py-4 px-8 ">
     {sidebarItems.map((link, index) => (
      <Link href={link.href} key={index}>
       <div
        className={`flex items-center gap-2 mb-2 p-2 rounded-xl text-white hover:bg-secondary hover:text-blue-600 hover:translate-x-2 hover:font-bold transition-all duration-100 ${
         pathname.startsWith(link.href) ? "bg-secondary text-blue-500 font-extrabold" : ""
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

    <div className="mt-auto py-4 px-8 items-center flex gap-2 hover:bg-primary/10 transition-all duration-300">

     <UserButton children/> {user?.firstName}
 
    </div>
   </div>
   {!sideBarOpen ? (
    <button
     className="absolute top-6 left-4 p-2 bg-accent rounded-full hover:bg-secondary transition-colors duration-300"
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
    {children}
   </div>

  </div>
 );
}
