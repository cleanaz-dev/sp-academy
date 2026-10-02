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
  onSpeechEnd?: () => void
): Promise<PronunciationScore> => {
  return new Promise((resolve, reject) => {
    // 1. Defensively extract token and region (works with string OR object)
    const token = typeof tokenData === "object" ? tokenData.token : tokenData;
    const speechRegion =
      (typeof tokenData === "object" && tokenData.region) ||
      process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION ||
      "eastus"; // fallback to default if not set

    if (!token) {
      return reject("Azure Speech token is missing.");
    }

    try {
      const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(token, speechRegion);
      speechConfig.speechRecognitionLanguage = targetLanguage;

      const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();

      const pronunciationAssessmentConfig = new sdk.PronunciationAssessmentConfig(
        referenceText,
        sdk.PronunciationAssessmentGradingSystem.HundredMark,
        sdk.PronunciationAssessmentGranularity.Word,
        true
      );

      const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
      pronunciationAssessmentConfig.applyTo(recognizer);

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
              pronunciationScore: pronunciationResult.pronunciationScore,
              accuracyScore: pronunciationResult.accuracyScore,
              fluencyScore: pronunciationResult.fluencyScore,
              completenessScore: pronunciationResult.completenessScore,
              recognizedText: result.text,
              words,
            });
          } else if (result.reason === sdk.ResultReason.NoMatch) {
            reject("We couldn't hear anything — please speak clearly and try again.");
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