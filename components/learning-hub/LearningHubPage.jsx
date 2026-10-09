"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Search,
  X,
  SearchX,
  Mic,
  MessageSquare,
  PenTool,
  Calendar,
  ChevronRight,
  Sparkles,
  Activity,
  Target,
} from "lucide-react";
import Link from "next/link";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -15,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};


export default function LearningHubPage({ reviews, path, userId }) {
  const [activeTab, setActiveTab] = useState("freestyle");
  const [searchQuery, setSearchQuery] = useState("");

  const freestyleSessions = reviews?.FreestyleSession || [];
  const journals = reviews?.dailyJournals || [];
  const conversations = reviews?.ConversationReview || [];

  const filterContent = () => {
    const query = searchQuery.toLowerCase();

    if (activeTab === "freestyle") {
      let filtered = freestyleSessions.filter(
        (session) =>
          session.topic?.toLowerCase().includes(query) ||
          session.targetLanguage?.toLowerCase().includes(query) ||
          session.mode?.toLowerCase().includes(query) ||
          session.level?.toLowerCase().includes(query)
      );
      return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    if (activeTab === "journals") {
      let filtered = journals.filter(
        (journal) =>
          journal.language?.toLowerCase().includes(query) ||
          journal.transcript?.toLowerCase().includes(query)
      );
      return filtered.sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate));
    }
    if (activeTab === "conversations") {
      let filtered = conversations.filter((review) =>
        review.id.toLowerCase().includes(query)
      );
      return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return [];
  };

  const filteredData = filterContent();

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans">
      {/* Header Section */}
      <header className="animate-gradient bg-linear-to-r from-violet-500 via-fuchsia-500 to-indigo-500 bg-size-[300%_300%] py-16 text-white shadow-md">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight">
            Your Learning Hub
          </h1>
          <p className="text-lg opacity-90 max-w-2xl font-medium">
            Track your language progress, review past mistakes, and see your fluency scores improve over time. 🚀
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 pt-10 pb-24">
        {/* Tab Navigation */}
        <div className="mb-8 flex flex-wrap gap-3">
          <TabButton
            active={activeTab === "freestyle"}
            onClick={() => setActiveTab("freestyle")}
            icon={<Mic size={18} />}
            label="Freestyle Sessions"
            activeColor="bg-violet-600 text-white shadow-md shadow-violet-200"
            inactiveColor="bg-white text-gray-600 hover:bg-violet-50 border border-gray-200"
          />
          <TabButton
            active={activeTab === "journals"}
            onClick={() => setActiveTab("journals")}
            icon={<PenTool size={18} />}
            label="Daily Journals"
            activeColor="bg-teal-500 text-white shadow-md shadow-teal-200"
            inactiveColor="bg-white text-gray-600 hover:bg-teal-50 border border-gray-200"
          />
          <TabButton
            active={activeTab === "conversations"}
            onClick={() => setActiveTab("conversations")}
            icon={<MessageSquare size={18} />}
            label="Conversations"
            activeColor="bg-indigo-500 text-white shadow-md shadow-indigo-200"
            inactiveColor="bg-white text-gray-600 hover:bg-indigo-50 border border-gray-200"
          />
        </div>

        {/* Search */}
        <div className="mb-10 w-full max-w-md">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 group-focus-within:text-violet-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by language, topic, or mode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-hidden transition-all focus:border-violet-300 focus:ring-4 focus:ring-violet-500/10 shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Lists */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredData.length > 0 ? (
              filteredData.map((item) => {
                if (activeTab === "freestyle") return <FreestyleCard key={item.id} session={item} />;
                if (activeTab === "journals") return <JournalCard key={item.id} journal={item} />;
                if (activeTab === "conversations") return <ConversationCard key={item.id} review={item} />;
              })
            ) : (
              <EmptyState message={`No ${activeTab} found.`} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// CUSTOM UI COMPONENTS
// ----------------------------------------------------------------------

function TabButton({ active, onClick, icon, label, activeColor, inactiveColor }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
        active ? activeColor : inactiveColor
      }`}
    >
      {icon}
      {label}
    </button>
  );
}



// --- EMPTY STATE ---
function EmptyState({ message }) {
  return (
    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-dashed border-gray-200">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
        <SearchX className="h-10 w-10 text-gray-300" />
      </div>
      <h3 className="mb-2 text-xl font-bold text-gray-800">
        Nothing here yet!
      </h3>
      <p className="text-gray-500 max-w-sm">
        {message} Complete an activity to start seeing your progress and reviews here.
      </p>
    </div>
  );
}