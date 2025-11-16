"use client";

import Link from "next/link";
import { DoubleAltArrowLeft } from "solar-icon-set";
import Image from "next/image";
import { navItems, settingItems } from "./NavLinks";
import { Button } from "../old-ui/button";
import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

export const Sidebar = ({ sidebarOpen, setSidebarOpen, pathname }) => {
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  useEffect(() => {
    const fetchIsAdmin = async () => {
      try {
        const response = await fetch("/api/users/is-admin");
        const data = await response.json();
        setIsUserAdmin(data.isAdmin); // Correctly accessing isAdmin field
      } catch (error) {
        console.error("Error fetching admin status:", error);
      }
    };

    fetchIsAdmin();
  }, []);
  return (
    <div className="relative z-10 flex h-full flex-col overflow-hidden">
      <div className="mt-3 flex w-full items-center justify-center">
        <Image
          src="/logo1.png"
          height={100}
          width={100}
          alt="logo"
          priority
          style={{ width: "auto", height: "auto" }}
          className="flex"
        />
      </div>

      <div className="flex-grow space-y-2 overflow-y-auto">
        {/* Sidebar Title */}
        <div className="flex px-4 py-2">
          <h1 className={`text-lg font-bold tracking-widest text-emerald-500`}>
            Menu
          </h1>
        </div>
        {/* Sidebar Nav */}
        {navItems.map((navItem, index) => (
          <div className="px-2" key={index}>
            <Link
              href={navItem.href}
              className={`group flex items-center gap-4 rounded-sm p-2 ${
                pathname.includes(navItem.href)
                  ? "bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 text-white"
                  : "text-blue-400"
              } hover:bg-gradient-to-r hover:from-green-300 hover:via-amber-300 hover:to-purple-300 hover:text-white`}
            >
              {navItem.icon}
              <div
                className={`text-xs ${
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
        <div className="my-4 flex px-4 py-2">
          <h1 className={`text-lg font-bold tracking-widest text-emerald-500`}>
            Settings
          </h1>
        </div>
        {settingItems.map((settingItem, index) => (
          <div className="px-2" key={index}>
            <Link
              href={settingItem.href}
              className={`group flex items-center gap-4 rounded-sm p-2 ${
                settingItem.href === pathname
                  ? "bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 text-white"
                  : "text-blue-400"
              } hover:bg-gradient-to-r hover:from-green-300 hover:via-amber-300 hover:to-purple-300 hover:text-white`}
            >
              {settingItem.icon}
              <span
                className={`text-xs ${
                  pathname.includes(settingItem.href)
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

      {isUserAdmin && sidebarOpen && (
        <div className="overflow-hidden rounded-lg p-2">
          <div className="mt-4 animate-[gradient_6s_ease_infinite] rounded-lg bg-gradient-to-r from-sky-400 via-emerald-400 to-violet-400 bg-[length:300%_300%] p-3 shadow-lg">
            <Link href="/admin" className="text-white">
              <Button
                className="flex w-full items-center justify-center gap-2 rounded-lg py-3 font-semibold shadow-md transition-all"
                variant="ghost"
              >
                <ShieldCheck className="h-5 w-5" />
                <span>Admin Center</span>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
