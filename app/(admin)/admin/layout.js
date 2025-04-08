"use client";

import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CirclePlus,
  Mail,
  ShieldCheck,
  Menu,
  X,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Tooltip } from "react-tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { UserButton } from "@clerk/nextjs";

export default function AdminLayout({ children }) {
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch user data from api/users/is-admin
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/users/is-admin");
        const data = await response.json();
        setIsAdminUser(data.isAdmin);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && !isAdminUser) {
      router.push("/unauthorized");
    }
  }, [isLoading, isAdminUser, router]);

  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Show a loading spinner while waiting for the fetch to complete
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <aside
        className={`relative bg-slate-400 text-white ${
          isSidebarOpen ? "w-48" : "w-[85px]"
        } p-4 transition-all duration-300 ease-in-out`}
      >
        {/* Sidebar Toggle Button */}
        <button
          className="mb-4 ml-3 text-white focus:outline-none"
          onClick={() => setSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        {/* Admin Panel Title */}
        <div className="relative mb-6 h-8">
          <div
            className={`flex items-center justify-center gap-2 transition-all ${
              isSidebarOpen
                ? "opacity-100 delay-200 duration-300"
                : "opacity-0 duration-0"
            }`}
          >
            <span>Admin Panel</span>
            <ShieldCheck className="h-5 w-5" strokeWidth={1.5} />
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="space-y-4 rounded-xl p-2 shadow-inner shadow-slate-500/50">
          <Link
            href="/admin"
            className="flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-gray-700"
            data-tooltip-id="sidebar-tooltip"
            data-tooltip-content="Dashboard"
          >
            <LayoutDashboard
              className="h-5 w-5 min-w-[20px]"
              strokeWidth={1.5}
            />
            <span
              className={`whitespace-nowrap text-sm transition-all duration-300 ${
                isSidebarOpen ? "opacity-100 delay-200" : "w-0 opacity-0"
              }`}
            >
              Dashboard
            </span>
          </Link>

          <Link
            href="/admin/emails"
            className="flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-gray-700"
            data-tooltip-id="sidebar-tooltip"
            data-tooltip-content="Email Manager"
          >
            <Mail className="h-5 w-5 min-w-[20px]" strokeWidth={1.5} />
            <span
              className={`whitespace-nowrap text-sm transition-all duration-300 ${
                isSidebarOpen ? "opacity-100 delay-200" : "w-0 opacity-0"
              }`}
            >
              Email Manager
            </span>
          </Link>

          <Link
            href="/admin/generate"
            className="flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-gray-700"
            data-tooltip-id="sidebar-tooltip"
            data-tooltip-content="Content Generator"
          >
            <Lightbulb className="h-5 w-5 min-w-[20px]" strokeWidth={1.5} />
            <span
              className={`whitespace-nowrap text-sm transition-all duration-300 ${
                isSidebarOpen ? "opacity-100 delay-200" : "w-0 opacity-0"
              }`}
            >
              Generator
            </span>
          </Link>
        </nav>

        {/* Tooltip for Collapsed Sidebar */}
        {!isSidebarOpen && (
          <Tooltip id="sidebar-tooltip" place="right" className="z-50" />
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        <main className="">{children}</main>
      </div>
    </div>
  );
}
