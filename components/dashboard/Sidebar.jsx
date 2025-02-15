"use client";

import Link from "next/link";
import { DoubleAltArrowLeft } from "solar-icon-set";
import Image from "next/image";
import { navItems, settingItems } from "./NavLinks";


export const Sidebar = ({ sidebarOpen, setSidebarOpen, pathname }) => {
  return (
    <div className="flex flex-col h-full relative z-10">
      <div className="flex px-4 py-2 items-center justify-between">
        <div className="flex gap-2 items-center justify-center text-white w-full">
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
        <div className="flex px-4 py-2 ">
          <h1 className={`text-emerald-500 text-lg font-bold tracking-widest`}>
            Menu
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
        <div className="flex px-4 py-2 my-4">
          <h1 className={`text-emerald-500 text-lg font-bold tracking-widest `}>
            Settings
          </h1>
        </div>
        {settingItems.map((settingItem, index) => (
          <div className="px-2" key={index}>
            <Link
              href={settingItem.href}
              className={`flex gap-4 items-center p-2 rounded-sm group
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
    </div>
  );
};