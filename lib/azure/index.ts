import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

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
  token: string,
  onRecognizerReady?: (recognizer: sdk.SpeechRecognizer) => void
): Promise<PronunciationScore> => {
  return new Promise((resolve, reject) => {
    const speechRegion = process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION;

    if (!speechRegion) {
      return reject("Azure Speech region is not configured.");
    }

    const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(token, speechRegion);
    speechConfig.speechRecognitionLanguage = targetLanguage;

    const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();

    // EnableMiscue: true (4th arg) is what unlocks Omission/Insertion detection,
    // not just accuracy on words Azure thinks you attempted.
    const pronunciationAssessmentConfig = new sdk.PronunciationAssessmentConfig(
      referenceText,
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.Word,
      true
    );

    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
    pronunciationAssessmentConfig.applyTo(recognizer);

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
          reject("We couldn't hear anything — try again.");
        }
        recognizer.close();
      },
      (error) => {
        recognizer.close();
        reject(`Azure Error: ${error}`);
      }
    );
  });
};