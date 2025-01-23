// components/PronunciationAssessment.jsx
"use client";

import { useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mic,
  MicOff,
  Info,
  Volume2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { WaveformVisualizer } from "./WaveformVisualizer";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const SUPPORTED_LANGUAGES = {
  "en-US": "English (US)",
  "es-ES": "Spanish (Spain)",
  "fr-FR": "French",
  "de-DE": "German",
  "it-IT": "Italian",
};

export default function PronunciationAssessment({ userId, storyText, storyId }) {
  const [isRecording, setIsRecording] = useState(false);
  const [referenceText, setReferenceText] = useState(storyText);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("record");
  const [language, setLanguage] = useState("fr-FR");
  const [interimResults, setInterimResults] = useState("");
  const [isPracticeSaving, setIsPracticeSaving] = useState(false);

  const mediaRecorder = useRef(null);
  const audioContext = useRef(null);
  const audioChunks = useRef([]);

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getErrorTypeDescription = (errorType) => {
    const errorTypes = {
      None: "Correct",
      Omission: "Omitted",
      Insertion: "Added unnecessarily",
      Mispronunciation: "Mispronounced",
    };
    return errorTypes[errorType] || errorType;
  };

  const getGroupedWords = (words) => {
    if (!words)
      return { excellent: [], good: [], needsWork: [], mispronounced: [] };

    return words.reduce(
      (acc, word) => {
        if (word.accuracyScore >= 90) {
          acc.excellent.push(word);
        } else if (word.accuracyScore >= 80) {
          acc.good.push(word);
        } else if (word.accuracyScore >= 60) {
          acc.needsWork.push(word);
        } else {
          acc.mispronounced.push(word);
        }
        return acc;
      },
      { excellent: [], good: [], needsWork: [], mispronounced: [] }
    );
  };

  const playCorrectPronunciation = async (word) => {
    try {
      const response = await fetch("/api/synthesize-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: word, language }),
      });

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error("Error synthesizing speech:", error);
    }
  };

  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  };

  const startRecording = async () => {
    try {
      setError(null);

      if (isMobileDevice()) {
        // Mobile-specific code
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        mediaRecorder.current = new MediaRecorder(stream);

        audioChunks.current = [];

        mediaRecorder.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.current.push(event.data);
          }
        };

        mediaRecorder.current.onstop = async () => {
          const tracks = stream.getTracks();
          tracks.forEach((track) => track.stop());

          if (audioChunks.current.length > 0) {
            await processAudio();
          } else {
            setError("No audio data recorded");
          }
        };

        mediaRecorder.current.start();
        setIsRecording(true);
      } else {
        // Desktop-specific code
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            sampleRate: 16000,
            sampleSize: 16,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        audioContext.current = new (window.AudioContext ||
          window.webkitAudioContext)({
          sampleRate: 16000,
        });

        mediaRecorder.current = new MediaRecorder(stream, {
          mimeType: "audio/webm",
          audioBitsPerSecond: 128000,
        });

        audioChunks.current = [];

        mediaRecorder.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.current.push(event.data);
          }
        };

        mediaRecorder.current.onstop = async () => {
          const tracks = stream.getTracks();
          tracks.forEach((track) => track.stop());

          if (audioChunks.current.length > 0) {
            await processAudio();
          } else {
            setError("No audio data recorded");
          }
        };

        mediaRecorder.current.start(100);
        setIsRecording(true);
      }
    } catch (error) {
      setError(
        "Error accessing microphone. Please ensure you have granted permission."
      );
      console.error("Error accessing microphone:", error);
    }
  };

  const processAudio = async () => {
    try {
      const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContext.current.decodeAudioData(
        arrayBuffer
      );
      const wavBuffer = await convertToWav(audioBuffer);
      const wavBlob = new Blob([wavBuffer], { type: "audio/wav" });

      await assessPronunciation(wavBlob);
    } catch (error) {
      console.error("Error processing audio:", error);
      setError("Error processing audio. Please try again.");
    }
  };

  const convertToWav = async (audioBuffer) => {
    const numOfChannels = 1;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1;
    const bitDepth = 16;

    const length = audioBuffer.length * numOfChannels * (bitDepth / 8);
    const buffer = new ArrayBuffer(44 + length);
    const view = new DataView(buffer);

    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + length, true);
    writeString(view, 8, "WAVE");
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numOfChannels * (bitDepth / 8), true);
    view.setUint16(32, numOfChannels * (bitDepth / 8), true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, "data");
    view.setUint32(40, length, true);

    const channelData = audioBuffer.getChannelData(0);
    let offset = 44;
    for (let i = 0; i < channelData.length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(
        offset,
        sample < 0 ? sample * 0x8000 : sample * 0x7fff,
        true
      );
      offset += 2;
    }

    return buffer;
  };

  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const assessPronunciation = async (wavBlob) => {
    if (!referenceText.trim()) {
      setError("Please enter reference text");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("audio", wavBlob, "recording.wav");
      formData.append("referenceText", referenceText);
      formData.append("language", language);

      const response = await fetch("/api/pronunciation-assessment", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Assessment failed");
      }

      setResult(data);
      setActiveTab("results");
    } catch (error) {
      setError("Failed to assess pronunciation. Please try again.");
      console.error("Error assessing pronunciation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const ScoreExplanation = ({ score, type }) => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="ghost" size="icon">
          <Info className="h-4 w-4" />
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">
            {type} Score: {score?.toFixed(2)}%
          </h4>
          <p className="text-sm">
            {score >= 80
              ? "Excellent!"
              : score >= 60
              ? "Good, but could be improved."
              : "Needs practice."}
          </p>
          <Progress value={score} className="h-2" />
        </div>
      </HoverCardContent>
    </HoverCard>
  );

  const WordGroup = ({ title, words, color, icon: Icon }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className={`h-5 w-5 ${color}`} />
        <h4 className="font-medium">
          {title} ({words.length})
        </h4>
      </div>
      {words.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {words.map((word, index) => (
            <HoverCard key={`${word.word}-${index}`}>
              <HoverCardTrigger asChild>
                <div
                  className={`p-2 rounded-lg border cursor-pointer hover:bg-gray-50`}
                >
                  <div className="flex justify-between items-center">
                    <span>{word.word}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => playCorrectPronunciation(word.word)}
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </HoverCardTrigger>
              <HoverCardContent>
                <div className="space-y-2">
                  <h4 className="font-semibold">{word.word}</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Accuracy:</div>
                    <div>{word.accuracyScore.toFixed(1)}%</div>
                    <div>Error Type:</div>
                    <div>{getErrorTypeDescription(word.errorType)}</div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          ))}
        </div>
      )}
    </div>
  );

  const handlePracticeWords = async () => {
    if (!result?.words) return;

    setIsPracticeSaving(true);

    const groupedWords = getGroupedWords(result.words);
    const wordsForPractice = [
      ...groupedWords.needsWork,
      ...groupedWords.mispronounced,
    ];
    console.log("StoryID:",storyId)
    try {
      const response = await fetch("/api/practice-vocabulary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          words: wordsForPractice,
          language: language,
          timestamp: new Date().toISOString(),
          storyId: storyId || "No story ID available"
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save practice words");
      }

      toast.success("Words saved for practice successfully");
    } catch (error) {
      console.error("Error saving practice words:", error);
      toast.error("Failed to save practice words");
    } finally {
      setIsPracticeSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pt-6">
      <Card>
        <CardHeader>
          <CardTitle>Pronunciation Assessment</CardTitle>
          <CardDescription>
            Practice and improve your pronunciation with real-time feedback.
            Please read the story provided.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="record">Record</TabsTrigger>
              <TabsTrigger value="results" disabled={!result}>
                Results
              </TabsTrigger>
            </TabsList>

            <TabsContent value="record" className="space-y-4">
              <div className="space-y-4">
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                      <SelectItem key={code} value={code}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Card
                  className="h-auto max-h-full resize-none overflow-auto p-2 whitespace-pre-wrap"
                  contentEditable={false}
                  disabled={isRecording || isLoading}
                >
                  <span className="text-sm">{referenceText}</span>
                </Card>

                <WaveformVisualizer isRecording={isRecording} />

                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isLoading}
                  variant={isRecording ? "destructive" : "default"}
                  className="w-full"
                >
                  {isRecording ? (
                    <>
                      <MicOff className="mr-2 h-4 w-4" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="mr-2 h-4 w-4" />
                      Start Recording
                    </>
                  )}
                </Button>

                {isLoading && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {error && (
                  <Card className="bg-red-50">
                    <CardContent className="pt-6">
                      <p className="text-red-600">{error}</p>
                    </CardContent>
                  </Card>
                )}

                {interimResults && (
                  <Card className="bg-gray-50">
                    <CardContent className="pt-4">
                      <p className="text-sm text-gray-600">{interimResults}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="results">
              {result && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Overall Assessment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center justify-between">
                          <span>Accuracy</span>
                          <div className="flex items-center">
                            <span
                              className={getScoreColor(result.accuracyScore)}
                            >
                              {result.accuracyScore?.toFixed(2)}%
                            </span>
                            <ScoreExplanation
                              score={result.accuracyScore}
                              type="Accuracy"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Pronunciation</span>
                          <div className="flex items-center">
                            <span
                              className={getScoreColor(
                                result.pronunciationScore
                              )}
                            >
                              {result.pronunciationScore?.toFixed(2)}%
                            </span>
                            <ScoreExplanation
                              score={result.pronunciationScore}
                              type="Pronunciation"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Fluency</span>
                          <div className="flex items-center">
                            <span
                              className={getScoreColor(result.fluencyScore)}
                            >
                              {result.fluencyScore?.toFixed(2)}%
                            </span>
                            <ScoreExplanation
                              score={result.fluencyScore}
                              type="Fluency"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Completeness</span>
                          <div className="flex items-center">
                            <span
                              className={getScoreColor(
                                result.completenessScore
                              )}
                            >
                              {result.completenessScore?.toFixed(2)}%
                            </span>
                            <ScoreExplanation
                              score={result.completenessScore}
                              type="Completeness"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Word Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {result.words && (
                          <>
                            <WordGroup
                              title="Excellent Pronunciation"
                              words={getGroupedWords(result.words).excellent}
                              color="text-green-600"
                              icon={CheckCircle}
                            />
                            <Separator />
                            <WordGroup
                              title="Good Pronunciation"
                              words={getGroupedWords(result.words).good}
                              color="text-blue-600"
                              icon={CheckCircle}
                            />
                            <Separator />
                            <WordGroup
                              title="Needs Practice"
                              words={getGroupedWords(result.words).needsWork}
                              color="text-yellow-600"
                              icon={AlertCircle}
                            />
                            <Separator />
                            <WordGroup
                              title="Mispronounced Words"
                              words={
                                getGroupedWords(result.words).mispronounced
                              }
                              color="text-red-600"
                              icon={AlertCircle}
                            />
                            <Button
                              onClick={handlePracticeWords}
                              disabled={
                                isPracticeSaving ||
                                !result?.words ||
                                (getGroupedWords(result.words).needsWork
                                  .length === 0 &&
                                  getGroupedWords(result.words).mispronounced
                                    .length === 0)
                              }
                            >
                              {isPracticeSaving ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                "Practice Words"
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Text Comparison</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          Reference Text
                        </h4>
                        <p className="p-3 bg-blue-50 rounded-lg">
                          {referenceText}
                        </p>
                      </div>
                      <Separator />
                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          Recognized Text
                        </h4>
                        <p className="p-3 bg-gray-50 rounded-lg">
                          {result.recognizedText}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
