import * as sdk from "microsoft-cognitiveservices-speech-sdk";

export interface WordAssessment {
  word: string;
  accuracyScore: number;
  errorType: "None" | "Mispronunciation" | "Omission" | "Insertion" | string;
}

export interface PronunciationScore {
  pronunciationScore: number;
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  recognizedText: string;
  words: WordAssessment[];
}

export const evaluatePronunciation = async (
  referenceText: string,
  targetLanguage: string,
  tokenData: string | { token: string; region?: string },
  onRecognizerReady?: (recognizer: sdk.SpeechRecognizer) => void,
  onSpeechEnd?: () => void,
  onSessionStarted?: () => void
): Promise<PronunciationScore> => {
  return new Promise((resolve, reject) => {
    const token = typeof tokenData === "object" ? tokenData.token : tokenData;
    const speechRegion =
      (typeof tokenData === "object" && tokenData.region) ||
      process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION ||
      "eastus";

    if (!token) {
      return reject("Azure Speech token is missing.");
    }

    const cleanRef = referenceText.trim();
    if (!cleanRef) {
      return reject("Reference text is missing.");
    }

    try {
      const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(token, speechRegion);
      speechConfig.speechRecognitionLanguage = targetLanguage;

      // Give the user 5 seconds to read the card/take a breath before timing out,
      // and end 800ms after they finish speaking so short words wrap up snappily.
      speechConfig.setProperty(
        sdk.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs,
        "5000"
      );
      speechConfig.setProperty(
        sdk.PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs,
        "800"
      );

      const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();

      // FIX 1: Only enableMiscue on longer sentences (4+ words).
      // On 1-3 word flashcards, disable miscue so Azure grades how close the attempt was
      // instead of marking slightly mispronounced words as "Omission / Skipped (0%)".
      const wordCount = cleanRef.split(/\s+/).filter(Boolean).length;
      const enableMiscue = wordCount >= 4;

      const pronunciationAssessmentConfig = new sdk.PronunciationAssessmentConfig(
        cleanRef,
        sdk.PronunciationAssessmentGradingSystem.HundredMark,
        sdk.PronunciationAssessmentGranularity.Word,
        enableMiscue
      );

      const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
      pronunciationAssessmentConfig.applyTo(recognizer);

      // FIX 2: Bias Azure's acoustic model toward the exact flashcard text.
      // This stops Azure from guessing across the entire French dictionary on single words.
      const phraseList = sdk.PhraseListGrammar.fromRecognizer(recognizer);
      phraseList.addPhrase(cleanRef);

      // FIX 3: Notify when the mic + WebSocket session is actually live
      recognizer.sessionStarted = () => {
        onSessionStarted?.();
      };

      // Trigger "Analyzing..." as soon as the user stops speaking
      recognizer.speechEndDetected = () => {
        onSpeechEnd?.();
      };

      onRecognizerReady?.(recognizer);

      recognizer.recognizeOnceAsync(
        (result) => {
          if (result.reason === sdk.ResultReason.RecognizedSpeech) {
            const pronunciationResult = sdk.PronunciationAssessmentResult.fromResult(result);

            const rawWords = (pronunciationResult as any).detailResult?.Words || [];
            const words: WordAssessment[] = rawWords.map((w: any) => ({
              word: w.Word,
              accuracyScore: w.PronunciationAssessment?.AccuracyScore ?? 0,
              errorType: w.PronunciationAssessment?.ErrorType ?? "None",
            }));

            resolve({
              pronunciationScore: pronunciationResult.pronunciationScore ?? 0,
              accuracyScore: pronunciationResult.accuracyScore ?? 0,
              fluencyScore: pronunciationResult.fluencyScore ?? 0,
              completenessScore: pronunciationResult.completenessScore ?? 0,
              recognizedText: result.text,
              words,
            });
          } else if (result.reason === sdk.ResultReason.NoMatch) {
            // FIX 4: Check WHY it didn't match instead of blaming the mic every time
            const noMatchDetail = sdk.NoMatchDetails.fromResult(result);

            if (noMatchDetail.reason === sdk.NoMatchReason.InitialSilenceTimeout) {
              reject("No audio detected — check that your mic is unmuted and try again.");
            } else {
              // Azure DID hear the user speak, but the pronunciation was too far off to align.
              // Return a low score so the words highlight in red ("Try Again") instead of throwing a mic error.
              const fallbackWords: WordAssessment[] = cleanRef
                .split(/\s+/)
                .filter(Boolean)
                .map((w) => ({
                  word: w,
                  accuracyScore: 25,
                  errorType: "Mispronunciation",
                }));

              resolve({
                pronunciationScore: 25,
                accuracyScore: 25,
                fluencyScore: 30,
                completenessScore: 0,
                recognizedText: "",
                words: fallbackWords,
              });
            }
          } else if (result.reason === sdk.ResultReason.Canceled) {
            const cancellation = sdk.CancellationDetails.fromResult(result);
            reject(`Azure Error: ${cancellation.errorDetails || cancellation.reason}`);
          }
          recognizer.close();
        },
        (error) => {
          recognizer.close();
          reject(`Azure Error: ${error}`);
        }
      );
    } catch (e: any) {
      reject(`Setup Error: ${e.message || e}`);
    }
  });
};