"use client";

import { usePronunciation } from "@/context/pronunciation-context";
import { useMiniAudioPlayer } from "@/hooks/use-mini-audio-player";



export function PronunciationStep({ data, onNext }: { data: any; onNext: () => void }) {
  const { play, isPlaying, currentS3Key } = useMiniAudioPlayer();
  const { isRecording, score, error, assessSpeech, cancelAssessment } = usePronunciation();

  const targetLang = "fr-FR"; // In production, pass this down from the parent wrapper!

  const handleRecordToggle = () => {
    if (isRecording) {
      cancelAssessment();
    } else {
      assessSpeech(data.referenceText, targetLang);
    }
  };

  const isThisAudioPlaying = isPlaying && currentS3Key === data.audioS3Key;

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-bold mb-4">Step 3: Pronunciation Practice</h2>
      
      <div className="mb-6 text-center p-6 bg-gray-50 rounded border">
        <p className="text-2xl font-bold mb-2">{data.referenceText}</p>
      </div>
      
      <div className="mb-6">
        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Focus Sounds:</p>
        <ul className="list-disc pl-5 text-gray-700">
          {data.focusSounds.map((fs: any, idx: number) => (
            <li key={idx}>{fs.sound}</li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Play S3 Reference Audio */}
        <button 
          onClick={() => play(data.audioS3Key)}
          className={`flex-1 px-4 py-3 font-semibold rounded flex items-center justify-center gap-2 ${
            isThisAudioPlaying ? 'bg-blue-200 text-blue-900' : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          <span>{isThisAudioPlaying ? "🔊 Playing..." : "🔊 Play Reference"}</span> 
        </button>
        
        {/* Record with Azure Pronunciation */}
        <button 
          onClick={handleRecordToggle}
          className={`flex-1 px-4 py-3 font-bold rounded flex items-center justify-center gap-2 border ${
            isRecording 
              ? 'bg-red-500 text-white border-red-600 animate-pulse' 
              : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-300'
          }`}
        >
          <span>🎤</span> {isRecording ? "Stop Recording" : "Click to Speak"}
        </button>
      </div>

      {/* AZURE RESULTS DISPLAY */}
      {error && (
        <div className="p-4 mb-4 bg-red-100 text-red-700 rounded border border-red-300">
          Error: {error}
        </div>
      )}

      {score && (
        <div className="p-4 mb-6 bg-green-50 border border-green-200 rounded">
          <h3 className="font-bold text-green-900 mb-2">Azure Pronunciation Score:</h3>
          <div className="flex gap-4 text-sm font-mono">
            <div>Pronunciation: <span className="font-bold">{score.pronunciationScore}</span></div>
            <div>Accuracy: <span className="font-bold">{score.accuracyScore}</span></div>
            <div>Fluency: <span className="font-bold">{score.fluencyScore}</span></div>
          </div>
        </div>
      )}

      <button 
        onClick={onNext} 
        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded"
      >
        Next: Listening
      </button>
    </div>
  );
}