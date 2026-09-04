"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  BookOpen,
  Search,
  X,
  SearchX,
  Mic,
  MessageSquare,
  PenTool,
  Calendar,
  BarChart,
} from "lucide-react";
import Link from "next/link";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

// Helper for formatting dates safely
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

  // Extract data safely from the passed server object
  const freestyleSessions = reviews?.FreestyleSession || [];
  const journals = reviews?.dailyJournals || [];
  const conversations = reviews?.ConversationReview || [];

  // Centralized filter function based on active tab
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
      // Sort by newest first
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
      // If you later include the 'conversation' relation in your Prisma query, you can filter by its title too
      let filtered = conversations.filter(
        (review) => review.id.toLowerCase().includes(query)
      );
      return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return [];
  };

  const filteredData = filterContent();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <header className="animate-[gradient_6s_ease_infinite] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 bg-[length:300%_300%] py-16 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="mb-4 text-4xl font-bold">Your Learning Hub</h1>
          <p className="text-xl opacity-90 max-w-2xl">
            Track your language progress, review past mistakes, and see your fluency scores improve over time. 🚀
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 pt-8 pb-20">
        {/* Tab Navigation */}
        <div className="mb-6 flex flex-wrap gap-4">
          <Button
            variant={activeTab === "freestyle" ? "default" : "outline"}
            onClick={() => setActiveTab("freestyle")}
            className="relative"
          >
            <Mic className="mr-2 h-4 w-4" />
            Freestyle Sessions
          </Button>
          <Button
            variant={activeTab === "journals" ? "default" : "outline"}
            onClick={() => setActiveTab("journals")}
            className="relative"
          >
            <PenTool className="mr-2 h-4 w-4" />
            Daily Journals
          </Button>
          <Button
            variant={activeTab === "conversations" ? "default" : "outline"}
            onClick={() => setActiveTab("conversations")}
            className="relative"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Conversations
          </Button>
        </div>

        {/* Search */}
        <div className="mb-8 w-full max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
            <input
              type="text"
              placeholder="Search by language, topic, or mode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-gray-200 py-2 pl-10 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Lists */}
        <AnimatePresence mode="wait">
          {/* FREESTYLE TAB */}
          {activeTab === "freestyle" && (
            <motion.div
              key="freestyle"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            >
              {filteredData.length > 0 ? (
                filteredData.map((session) => (
                  <Card key={session.id} className="flex flex-col justify-between transition-shadow hover:shadow-lg border-l-4 border-l-violet-500">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">
                          {session.topic || "Open Conversation"}
                        </CardTitle>
                        <Badge variant="secondary" className="capitalize">
                          {session.targetLanguage}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">{session.mode}</Badge>
                        <Badge variant="outline" className="text-xs">{session.level}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center text-sm text-gray-500 justify-between">
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4" />
                            <span>{formatDate(session.createdAt)}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-1 h-4 w-4" />
                            <span>{Math.round(session.duration / 60)} min</span>
                          </div>
                        </div>

                        {session.review ? (
                          <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 border border-green-100 flex justify-between items-center">
                            <span className="font-medium">Review Available</span>
                            {session.review.mistakes?.length > 0 && (
                               <Badge className="bg-green-600">{session.review.mistakes.length} Notes</Badge>
                            )}
                          </div>
                        ) : (
                          <div className="rounded-md bg-orange-50 p-3 text-sm text-orange-700 border border-orange-100">
                            Review Pending Processing...
                          </div>
                        )}

                        <Link href={`/learning-hub/freestyle/${session.id}`} className="w-full mt-2">
                          <Button className="w-full" disabled={!session.review}>
                            {session.review ? "View Full Review" : "Processing"}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <EmptyState message="No freestyle sessions found." />
              )}
            </motion.div>
          )}

          {/* JOURNALS TAB */}
          {activeTab === "journals" && (
            <motion.div
              key="journals"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            >
              {filteredData.length > 0 ? (
                filteredData.map((journal) => (
                  <Card key={journal.id} className="flex flex-col justify-between transition-shadow hover:shadow-lg border-l-4 border-l-fuchsia-500">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">Daily Journal</CardTitle>
                        <Badge variant="secondary" className="capitalize">
                          {journal.language || "en-US"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-4">
                         <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="mr-1 h-4 w-4" />
                          <span>{formatDate(journal.entryDate)}</span>
                        </div>

                        {journal.review && journal.review.overallScore !== null ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-sm font-medium text-gray-600 flex items-center">
                                <BarChart className="mr-2 h-4 w-4" /> Overall Score
                              </span>
                              <span className="font-bold text-indigo-600 text-lg">
                                {journal.review.overallScore}%
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                                <div>Fluency: <span className="font-medium text-gray-900">{journal.review.fluencyScore}%</span></div>
                                <div>Accuracy: <span className="font-medium text-gray-900">{journal.review.accuracyScore}%</span></div>
                            </div>
                          </div>
                        ) : (
                           <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-500 text-center italic">
                            No scored review generated yet.
                          </div>
                        )}

                        <Link href={`/learning-hub/journal/${journal.id}`} className="w-full mt-2">
                          <Button className="w-full" variant="outline">
                            View Analysis
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <EmptyState message="No journal entries found." />
              )}
            </motion.div>
          )}

          {/* CONVERSATIONS TAB */}
          {activeTab === "conversations" && (
            <motion.div
              key="conversations"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            >
              {filteredData.length > 0 ? (
                filteredData.map((review) => (
                  <Card key={review.id} className="flex flex-col justify-between transition-shadow hover:shadow-lg border-l-4 border-l-indigo-500">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">Structured Conversation</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="mr-1 h-4 w-4" />
                          <span>{formatDate(review.createdAt)}</span>
                        </div>

                        <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 flex items-center justify-between">
                            <span className="text-sm font-medium text-indigo-800">Grammar & Vocab Mistakes</span>
                            <Badge className="bg-indigo-600 hover:bg-indigo-700">
                                {review.mistakes?.length || 0} Corrected
                            </Badge>
                        </div>

                        <Link href={`/learning-hub/conversation/${review.conversationId}`} className="w-full mt-2">
                          <Button className="w-full">
                            View Mistakes & Notes
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <EmptyState message="No conversation reviews found." />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Reusable Empty State Component
function EmptyState({ message }) {
  return (
    <div className="col-span-full py-16 text-center">
      <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <SearchX className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mb-2 text-lg font-medium text-gray-900">
        Nothing here yet!
      </h3>
      <p className="text-gray-500">
        {message} Try completing a session to see your progress here.
      </p>
    </div>
  );
}