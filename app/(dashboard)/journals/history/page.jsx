import JournalHistoryPage from "@/components/journals/JournalHistoryPage";
import React from "react";
import { getJournalByUserId } from "@/lib/actions";
import { auth } from "@clerk/nextjs/server";

export default async function JournalHistory() {
  const { userId } = auth();
  if (!userId) {
    console.error("User is not authenticated");
    return <div>Please log in to view your journals.</div>;
  }
  const userData = await getJournalByUserId(userId);
  const journals = userData?.Journal || []; // Fallback to empty array if undefinedclear

  return (
    <div>
      <header className="bg-white flex justify-between items-center">
        <h1 className="header-title">Journal History</h1>
      </header>
      {journals.length > 0 ? (
        <JournalHistoryPage journals={journals} />
      ) : (
        <div>No journals available.</div>
      )}
    </div>
  );
}
