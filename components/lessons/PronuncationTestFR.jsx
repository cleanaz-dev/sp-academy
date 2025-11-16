"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "../old-ui/button";
import { Mic, Check, ChevronDown, ChevronUp } from "lucide-react";
import SpeakingModule from "./SpeakingModule"; // Assumed extracted
import { BarChart2 } from "lucide-react";
import { Activity } from "lucide-react";
import { Award } from "lucide-react";

export default function PronunciationTestFR({ targetText }) {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState(null);
  const [scores, setScores] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const transcriptRef = useRef("");
  const MAX_DURATION = 30000;

  useEffect(() => {
    if (
      !("SpeechRecognition" in window) &&
      !("webkitSpeechRecognition" in window)
    ) {
      setError("Speech recognition not supported. Use Chrome/Edge.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "fr-FR";

    recognitionRef.current.onresult = (event) => {
      let final = "";
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript.trim();
        if (event.results[i].isFinal) {
          final += text + " ";
        } else {
          interim = text;
        }
      }
      if (final) {
        transcriptRef.current = (transcriptRef.current + final).trim();
        setTranscript(transcriptRef.current);
      }
      setInterimTranscript(interim);

      const fullTranscript = (transcriptRef.current + interim)
        .trim()
        .toLowerCase()
        .replace(/[^\w\s]/g, "");
      const normalizedTarget = targetText
        .trim()
        .toLowerCase()
        .replace(/[^\w\s]/g, "");
      if (recording && fullTranscript === normalizedTarget) {
        stopRecording();
      }
    };

    recognitionRef.current.onerror = (event) => {
      setError(`Erreur de reconnaissance vocale : ${event.error}`);
      setRecording(false);
      setProcessing(false);
    };

    recognitionRef.current.onend = () => {
      if (!recording) return;
      setRecording(false);
    };

    return () => {
      recognitionRef.current?.stop();
      if (mediaRecorderRef.current?.state !== "inactive") {
        mediaRecorderRef.current?.stop();
      }
    };
  }, [recording, targetText]);

  const startRecording = async () => {
    try {
      setError(null);
      setTranscript("");
      setInterimTranscript("");
      setScores(null);
      setProcessing(false);
      setRecording(true);
      transcriptRef.current = "";
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.start(1000);
      recognitionRef.current.start();

      setTimeout(() => recording && stopRecording(), MAX_DURATION);
    } catch (err) {
      setError("Échec du démarrage de l'enregistrement : " + err.message);
      setRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current || !recognitionRef.current) return;

    setRecording(false);
    setProcessing(true);
    recognitionRef.current.stop();

    if (mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    if (audioChunksRef.current.length === 0) {
      setError("Aucune donnée audio capturée");
      setProcessing(false);
      return;
    }

    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    if (audioBlob.size === 0) {
      setError("Le fichier audio est vide");
      setProcessing(false);
      return;
    }

    const finalTranscript = transcriptRef.current.trim();
    if (!finalTranscript) {
      setError("Aucune transcription capturée");
      setProcessing(false);
      return;
    }

    const formData = new FormData();
    formData.append("user_audio_file", audioBlob, "recording.webm");
    formData.append("text", finalTranscript);
    formData.append("dialect", "fr-fr");

    try {
      const response = await fetch("/api/analyze-speechace", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        setScores(result.data.text_score);
        // Auto-expand analysis when results come in
        setShowAnalysis(true);
        const audio = new Audio(
          "https://spoonfed-audiofiles.s3.us-east-1.amazonaws.com/success_notification+(2).mp3",
        );
        audio.play().catch((err) => console.log("Audio play failed:", err));
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError("Échec de l'envoi de l'enregistrement : " + error.message);
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="mx-auto flex w-full flex-col rounded-lg bg-white">
      <div className="flex flex-col items-center">
        <PhraseDisplay
          target={targetText}
          spoken={transcript + interimTranscript}
        />

        <div className="flex items-center gap-4">
          <RecordingControls
            recording={recording}
            processing={processing}
            scores={scores}
            startRecording={startRecording}
            stopRecording={stopRecording}
          />

          <SpeakingModule
            text={targetText}
            speaker="Narrator"
            language="fr-FR"
            className="rounded-full bg-slate-100 p-4 text-gray-800 transition-all duration-200 hover:bg-slate-200 hover:text-blue-700"
            customCss={`size-12`}
          />
        </div>
      </div>

      {error && <div className="mt-2 text-sm text-red-700">{error}</div>}

      {scores && (
        <div className="mt-4 w-full">
          <Button
            type="button"
            onClick={() => setShowAnalysis(!showAnalysis)}
            variant="ghost"
            className="flex w-full items-center justify-between rounded-md py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <div className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-blue-500" />
              <span>Speech Analysis</span>
              {!showAnalysis && (
                <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                  {scores.speechace_score.pronunciation}%
                </span>
              )}
            </div>
            {showAnalysis ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </Button>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              showAnalysis ? "mt-4 max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <AnalysisDisplay scores={scores} />
          </div>
        </div>
      )}
    </div>
  );
}

function RecordingControls({
  recording,
  processing,
  scores,
  startRecording,
  stopRecording,
}) {
  const buttonSize = "48px";

  if (recording) {
    return (
      <Button
        type="button"
        onClick={stopRecording}
        disabled={!recording}
        className="flex items-center justify-center rounded-full bg-red-600 font-medium text-white transition-colors hover:bg-red-700"
        style={{ width: buttonSize, height: buttonSize }}
      >
        <Mic className="size-4 animate-pulse" />
      </Button>
    );
  } else if (processing) {
    return (
      <Button
        type="button"
        disabled
        className="relative flex items-center justify-center rounded-full bg-gray-600 font-medium text-white transition-colors"
        style={{ width: buttonSize, height: buttonSize }}
      >
        <Mic className="size-4" />
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
      </Button>
    );
  } else if (scores) {
    return (
      <Button
        type="button"
        disabled
        className="animate-scaleCheck flex items-center justify-center rounded-full bg-blue-500 font-medium text-white transition-colors"
        style={{ width: buttonSize, height: buttonSize }}
      >
        <Check className="size-4" />
      </Button>
    );
  } else {
    return (
      <Button
        type="button"
        onClick={startRecording}
        disabled={recording}
        className="relative flex items-center justify-center rounded-full bg-blue-600 font-medium text-white transition-colors hover:bg-blue-700"
        style={{ width: buttonSize, height: buttonSize }}
      >
        <Mic className="size-4" />
        <span className="animate-pulse-ring absolute inset-0 rounded-full border-2 border-blue-400 opacity-50" />
      </Button>
    );
  }
}

function PhraseDisplay({ target, spoken }) {
  const normalizeText = (text) => {
    return text
      .trim()
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
      .replace(/\s+/g, " ");
  };

  const targetWords = normalizeText(target).split(" ");
  const spokenWords = normalizeText(spoken).split(" ").filter(Boolean);

  return (
    <div className="mx-auto text-center">
      <h1>{target}</h1>

      <p className="text-lg leading-relaxed">
        {targetWords.map((word, index) => {
          const isMatched = spokenWords.some(
            (spokenWord) => spokenWord === word,
          );
          return (
            <span
              key={index}
              className={` ${
                isMatched ? "font-medium text-blue-600" : "text-gray-400/50"
              }`}
            >
              {word}
            </span>
          );
        })}
      </p>
    </div>
  );
}

function AnalysisDisplay({ scores }) {
  const CefrLabel = ({ level }) => {
    const colors = {
      A1: "bg-red-100 text-red-700",
      A2: "bg-orange-100 text-orange-700",
      B1: "bg-yellow-100 text-yellow-700",
      "B1+": "bg-amber-100 text-amber-700",
      B2: "bg-green-100 text-green-700",
      C1: "bg-blue-100 text-blue-700",
      "C1+": "bg-purple-100 text-purple-700",
      C2: "bg-indigo-100 text-indigo-700",
    };

    const labels = {
      A1: "Beginner",
      A2: "Elementary",
      B1: "Intermediate",
      "B1+": "Intermediate+",
      B2: "Upper Intermediate",
      C1: "Advanced",
      "C1+": "Fluent",
      C2: "Proficient",
    };

    return (
      <span
        className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
          colors[level] || "bg-gray-100 text-gray-700"
        }`}
      >
        {level}: {labels[level]}
      </span>
    );
  };

  function getScoreColor(score) {
    if (score >= 100) return "bg-indigo-100"; // C2
    if (score >= 95) return "bg-purple-100"; // C1+
    if (score >= 90) return "bg-blue-100"; // C1
    if (score >= 80) return "bg-green-100"; // B2
    if (score >= 70) return "bg-amber-100"; // B1+
    if (score >= 60) return "bg-yellow-100"; // B1
    if (score >= 40) return "bg-orange-100"; // A2
    if (score >= 20) return "bg-red-100"; // A1
    return "bg-gray-100"; // Below A1
  }

  const cefrToPercentage = (cefrLevel) => {
    const cefrMap = {
      A1: 20,
      A2: 40,
      B1: 60,
      B2: 80,
      C1: 90,
      "C1+": 95,
      C2: 100,
    };
    return cefrMap[cefrLevel] || 0;
  };
  return (
    <div className="space-y-5 rounded-lg p-4">
      {/* Overall score display */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <span className="text-sm font-medium text-gray-700">
          Overall Rating
        </span>
        <div
          className={`flex-shrink-0 rounded-full px-2.5 py-1 text-sm font-semibold text-gray-800 ${getScoreColor(
            cefrToPercentage(scores.cefr_score.pronunciation),
          )}`}
        >
          {scores.speechace_score.pronunciation}/100
        </div>
      </div>

      {/* Accuracy */}
      <div className="pt-2">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Accuracy</span>
          <Check className="h-4 w-4 text-green-500" />
        </div>
        <div className="mb-2 h-2 w-full rounded-full bg-gray-200">
          <div
            className={`${getScoreColor(
              cefrToPercentage(scores.cefr_score.pronunciation),
            )} h-2 rounded-full transition-all duration-700 ease-out`}
            style={{
              width: `${scores.speechace_score.pronunciation}%`,
            }}
          ></div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Score</span>
          <span className="text-sm font-semibold text-gray-800">
            {scores.speechace_score.pronunciation}%
          </span>
        </div>
      </div>

      {/* Fluency */}
      <div className="pt-2">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Fluency</span>
          <Activity className="h-4 w-4 text-blue-500" />
        </div>
        <div className="mb-2 h-2 w-full rounded-full bg-gray-200">
          <div
            className={`${getScoreColor(
              cefrToPercentage(scores.cefr_score.pronunciation),
            )} h-2 rounded-full transition-all duration-700 ease-out`}
            style={{
              width: `${cefrToPercentage(scores.cefr_score.pronunciation)}%`,
            }}
          ></div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Level</span>
          <CefrLabel level={scores.cefr_score.pronunciation || "A1"} />
        </div>
      </div>
    </div>
  );
}
