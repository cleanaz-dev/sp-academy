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

// Helper for formatting dates
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
};

export default function LearningHubPage({ reviews, userId }) {
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
      <header className="animate-[gradient_6s_ease_infinite] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 bg-[length:300%_300%] py-16 text-white shadow-md">
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
              className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition-all focus:border-violet-300 focus:ring-4 focus:ring-violet-500/10 shadow-sm"
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

// --- 1. FREESTYLE CARD (Violet Theme) ---
function FreestyleCard({ session }) {
  const isReady = !!session.review;
  const mistakesCount = session.review?.mistakes?.length || 0;

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-gray-100 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/10">
      <div>
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
            {session.topic || "Open Conversation"}
          </h3>
          <span className="shrink-0 rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700">
            {session.targetLanguage}
          </span>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-semibold text-gray-600 tracking-wider">
            {session.mode}
          </span>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-semibold text-gray-600 tracking-wider">
            {session.level}
          </span>
        </div>

        <div className="mb-6 flex items-center gap-6 text-sm text-gray-500 font-medium">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-violet-400" />
            {formatDate(session.createdAt)}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-violet-400" />
            {Math.round(session.duration / 60)} min
          </div>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between">
        {isReady ? (
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
              <Sparkles className="h-3 w-3 text-emerald-600" />
            </span>
            <span className="text-xs font-bold text-emerald-700">
              {mistakesCount} Notes
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500"></span>
            </span>
            <span className="text-xs font-bold text-amber-600">Processing...</span>
          </div>
        )}

        <Link href={`/learning-hub/freestyle/${session.id}`}>
          <button
            disabled={!isReady}
            className={`flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
              isReady
                ? "bg-violet-600 text-white hover:bg-violet-700"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            Review <ChevronRight className="h-4 w-4" />
          </button>
        </Link>
      </div>
    </div>
  );
}

// --- 2. JOURNAL CARD (Teal/Cyan Theme) ---
function JournalCard({ journal }) {
  const isReady = journal.review && journal.review.overallScore !== null;
  const score = isReady ? journal.review.overallScore : 0;

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-gray-100 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-500/10">
      <div>
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Daily Journal</h3>
          <span className="shrink-0 rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700">
            {journal.language || "en-US"}
          </span>
        </div>

        <div className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 font-medium">
          <Calendar className="h-4 w-4 text-teal-400" />
          {formatDate(journal.entryDate)}
        </div>

        {isReady ? (
          <div className="mb-6 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 p-4 border border-teal-100/50">
            <div className="flex items-end justify-between mb-2">
              <span className="text-sm font-bold text-teal-900">Overall Score</span>
              <span className="text-3xl font-extrabold text-teal-600 leading-none">
                {score}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-teal-100 mt-2">
              <div 
                className="h-full bg-teal-500 rounded-full transition-all duration-1000" 
                style={{ width: `${score}%` }} 
              />
            </div>
          </div>
        ) : (
          <div className="mb-6 rounded-2xl bg-gray-50 p-4 border border-gray-100 flex items-center justify-center min-h-[90px]">
            <span className="text-sm font-medium text-gray-400 italic">Score pending...</span>
          </div>
        )}
      </div>

      <Link href={`/learning-hub/journal/${journal.id}`} className="mt-auto w-full">
        <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-50 text-teal-700 py-2.5 text-sm font-bold hover:bg-teal-100 transition-colors">
          <Activity className="h-4 w-4" /> View Analysis
        </button>
      </Link>
    </div>
  );
}

// --- 3. CONVERSATION CARD (Indigo Theme) ---
function ConversationCard({ review }) {
  const mistakesCount = review.mistakes?.length || 0;

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-gray-100 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10">
      <div>
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
            {review.conversation?.title || "Structured Conversation"}
          </h3>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <Target className="h-4 w-4" />
          </span>
        </div>

        <div className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 font-medium">
          <Calendar className="h-4 w-4 text-indigo-400" />
          {formatDate(review.createdAt)}
        </div>

        <div className="mb-6 flex items-center justify-between rounded-xl bg-indigo-50 p-3 border border-indigo-100/50">
           <span className="text-sm font-bold text-indigo-900">Corrections Made</span>
           <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
             {mistakesCount}
           </span>
        </div>
      </div>

      <Link href={`/learning-hub/conversation/${review.conversationId}`} className="mt-auto w-full">
        <button className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-indigo-100 bg-white text-indigo-600 py-2 text-sm font-bold hover:border-indigo-200 hover:bg-indigo-50 transition-colors">
          View Corrections
        </button>
      </Link>
    </div>
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