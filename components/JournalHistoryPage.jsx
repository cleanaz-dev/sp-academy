'use client'

import React from 'react'
import { format } from 'date-fns'
import { Calendar, Volume2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import JournalRecordAgainModal from './JournalRecordAgainModel'

export default function JournalHistoryPage({ journals }) {
  
  const [selectedJournal, setSelectedJournal] = React.useState(journals[0] || null)
  const [activeTab, setActiveTab] = React.useState('summary')

  const formatTranscript = (transcript) => {
    return transcript.split('\n').map((line, index) => {
      const [speaker, text] = line.split(':')
      return (
        <div key={index} className="mb-2">
          <span className="font-semibold">{speaker}</span>
          <span>{text}</span>
        </div>
      )
    })
  }

  return (
    <div className="flex flex-col h-screen max-h-screen">
      <header className="bg-white p-4 py-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-500 ">Journal History</h1>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-1/4 border-gray-200 flex flex-col">
          <ScrollArea className="flex-1">
            {journals.length === 0 ? (
              <div className="m-4 text-center text-gray-500">No journals available</div>
            ) : (
              journals.map((journal) => (
                <Card 
                  key={journal.id} 
                  className={`m-4 cursor-pointer ${selectedJournal?.id === journal.id ? 'bg-blue-50' : ''}`}
                  onClick={() => setSelectedJournal(journal)}
                >
                  <CardHeader>
                    <CardTitle>{format(new Date(journal.createdAt), 'MMMM d, yyyy')}</CardTitle>
                  </CardHeader>
                  <CardContent className="gap-2 space-y-2">
                    <p><Calendar className="inline mr-2" />{format(new Date(journal.createdAt), 'h:mm a')}</p>
                    <p><Volume2 className="inline mr-2" />Length: {journal.length} seconds</p>
                   <JournalRecordAgainModal journalId={journal.id}/>
                  </CardContent>
                </Card>
              ))
            )}
          </ScrollArea>
        </aside>
        <main className="flex-1 p-6 overflow-auto max-w-5xl">
          {selectedJournal ? (
            <>
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <Button
                    variant={activeTab === 'summary' ? "default" : "outline"}
                    onClick={() => setActiveTab('summary')}
                    className="mr-2"
                  >
                    Summary
                  </Button>
                  <Button
                    variant={activeTab === 'transcript' ? "default" : "outline"}
                    onClick={() => setActiveTab('transcript')}
                  >
                    Transcript
                  </Button>
                </div>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Journal Entry Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Language: {selectedJournal.language}</p>
                  <audio controls src={selectedJournal.recordingUrl} className="mt-4 w-full">
                    Your browser does not support the audio element.
                  </audio>
                </CardContent>
              </Card>
              <ScrollArea className="h-[calc(100vh-400px)] mt-4">
                {activeTab === 'summary' ? (
                  <div className="whitespace-pre-wrap">{selectedJournal.summary}</div>
                ) : (
                  <div>{formatTranscript(selectedJournal.transcripts)}</div>
                )}
              </ScrollArea>
            </>
          ) : (
            <div className="text-center text-gray-500">Select a journal to view details</div>
          )}
        </main>
      </div>
    </div>
  )
}
