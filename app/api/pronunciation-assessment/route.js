// app/api/pronunciation-assessment/route.js
import { NextResponse } from "next/server";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";

export async function POST(request) {
  let recognizer = null;
  let speechConfig = null;
  let audioConfig = null;
  let pushStream = null;

  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio");
    const referenceText = formData.get("referenceText");
    const language = formData.get("language") || "en-US";

    if (!audioFile || !referenceText) {
      return NextResponse.json(
        { error: "Missing audio or reference text" },
        { status: 400 },
      );
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const audioData = Buffer.from(arrayBuffer);

    // Initialize Speech SDK configurations
    speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY,
      process.env.AZURE_SPEECH_REGION,
    );

    speechConfig.speechRecognitionLanguage = language;

    // Create and configure audio stream
    pushStream = sdk.AudioInputStream.createPushStream();

    // Write audio data in chunks
    const chunkSize = 32000;
    for (let i = 0; i < audioData.length; i += chunkSize) {
      const chunk = audioData.slice(
        i,
        Math.min(i + chunkSize, audioData.length),
      );
      pushStream.write(chunk);
    }
    pushStream.close();

    audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);

    // Configure pronunciation assessment
    const pronunciationAssessmentConfig = new sdk.PronunciationAssessmentConfig(
      referenceText,
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.Phoneme,
      true,
    );

    pronunciationAssessmentConfig.enableProsodyAssessment = true;
    pronunciationAssessmentConfig.enableSyllableAssessment = true;

    return new Promise((resolve, reject) => {
      recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
      pronunciationAssessmentConfig.applyTo(recognizer);

      let resultReceived = false;
      let timeoutId = null;

      const cleanup = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        if (recognizer) {
          recognizer.close();
        }
        if (pushStream) {
          pushStream.close();
        }
      };

      // Handle recognition result
      recognizer.recognized = (s, e) => {
        if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
          resultReceived = true;
          const pronunciationResult =
            sdk.PronunciationAssessmentResult.fromResult(e.result);

          // Calculate speaking rate
          const durationInSeconds = e.result.duration / 10000000; // Convert ticks to seconds
          const wordCount = pronunciationResult.detailResult.Words.length;
          const wordsPerMinute = (wordCount / durationInSeconds) * 60;

          const speakingRate =
            wordsPerMinute < 100
              ? "slow"
              : wordsPerMinute > 160
                ? "fast"
                : "optimal";

          // Extract word-level details with syllables
          const words = pronunciationResult.detailResult.Words.map((word) => ({
            word: word.Word,
            accuracyScore: word.PronunciationAssessment.AccuracyScore,
            errorType: word.PronunciationAssessment.ErrorType,
            duration: word.Duration,
            offset: word.Offset,
            syllables: word.Syllables?.map((s) => ({
              syllable: s.Syllable,
              accuracyScore: s.PronunciationAssessment?.AccuracyScore,
              duration: s.Duration,
            })),
          }));

          recognizer.stopContinuousRecognitionAsync(
            () => {
              cleanup();
              resolve(
                NextResponse.json({
                  recognizedText: e.result.text,
                  accuracyScore: pronunciationResult.accuracyScore,
                  pronunciationScore: pronunciationResult.pronunciationScore,
                  completenessScore: pronunciationResult.completenessScore,
                  fluencyScore: pronunciationResult.fluencyScore,
                  prosodyScore: pronunciationResult.prosodyScore,
                  words: words,
                  speakingRate: speakingRate,
                  duration: durationInSeconds,
                  wordsPerMinute,
                }),
              );
            },
            (err) => {
              console.error("Error stopping recognition:", err);
              cleanup();
              resolve(
                NextResponse.json(
                  {
                    error: "Error stopping recognition",
                  },
                  { status: 500 },
                ),
              );
            },
          );
        }
      };

      // Handle recognition cancellation
      recognizer.canceled = (s, e) => {
        if (!resultReceived) {
          cleanup();
          resolve(
            NextResponse.json(
              {
                error: e.errorDetails || "No speech recognized",
              },
              { status: 400 },
            ),
          );
        }
      };

      // Handle recognition errors
      recognizer.recognizing = (s, e) => {
        console.log(`RECOGNIZING: Text=${e.result.text}`);
      };

      recognizer.sessionStarted = (s, e) => {
        console.log("\nSession started event.");
      };

      recognizer.sessionStopped = (s, e) => {
        console.log("\nSession stopped event.");
        if (!resultReceived) {
          cleanup();
          resolve(
            NextResponse.json(
              {
                error: "Session stopped without results",
              },
              { status: 408 },
            ),
          );
        }
      };

      // Start recognition with timeout
      recognizer.startContinuousRecognitionAsync(
        () => {
          timeoutId = setTimeout(() => {
            if (!resultReceived) {
              recognizer.stopContinuousRecognitionAsync(
                () => {
                  cleanup();
                  resolve(
                    NextResponse.json(
                      {
                        error: "Recognition timeout",
                      },
                      { status: 408 },
                    ),
                  );
                },
                (err) => {
                  console.error("Error stopping recognition:", err);
                  cleanup();
                  resolve(
                    NextResponse.json(
                      {
                        error: "Error stopping recognition after timeout",
                      },
                      { status: 500 },
                    ),
                  );
                },
              );
            }
          }, 300000); // 5 minutes timeout
        },
        (error) => {
          console.error("Error starting recognition:", error);
          cleanup();
          reject(
            NextResponse.json(
              {
                error: "Error starting recognition",
              },
              { status: 500 },
            ),
          );
        },
      );
    });
  } catch (error) {
    // Cleanup in case of errors
    if (recognizer) {
      recognizer.close();
    }
    if (pushStream) {
      pushStream.close();
    }
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
