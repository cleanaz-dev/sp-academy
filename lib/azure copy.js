//app/lib/azure.js

import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

export async function performSpeechAssessment(audioData, referenceText, language = 'en-US') {
  let recognizer = null;
  let speechConfig = null;
  let audioConfig = null;
  let pushStream = null;

  try {
    speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY,
      process.env.AZURE_SPEECH_REGION
    );
    
    speechConfig.speechRecognitionLanguage = language;

    pushStream = sdk.AudioInputStream.createPushStream();
    pushStream.write(audioData);
    pushStream.close();

    audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);

    const normalizedReferenceText = referenceText.toLowerCase().trim();
    
    const pronunciationAssessmentConfig = new sdk.PronunciationAssessmentConfig(
      normalizedReferenceText,
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.Phoneme
    );

    pronunciationAssessmentConfig.enableProsodyAssessment = true;

    return new Promise((resolve, reject) => {
      recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
      pronunciationAssessmentConfig.applyTo(recognizer);

      recognizer.recognized = (s, e) => {
        if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
          const pronunciationResult = sdk.PronunciationAssessmentResult.fromResult(e.result);
          const normalizedRecognized = e.result.text.toLowerCase().replace(/[.,!?]/g, '').trim();

          recognizer.stopContinuousRecognitionAsync(() => {
            cleanup();
            resolve({
              recognizedText: normalizedRecognized,
              accuracyScore: pronunciationResult.accuracyScore,
              pronunciationScore: pronunciationResult.pronunciationScore,
              completenessScore: pronunciationResult.completenessScore,
              fluencyScore: pronunciationResult.fluencyScore,
              match: normalizedRecognized === normalizedReferenceText
            });
          });
        }
      };

      recognizer.canceled = (s, e) => {
        console.log('Recognition Canceled:', e.errorDetails);
        cleanup();
        reject(new Error(e.errorDetails || 'Recognition canceled'));
      };

      const cleanup = () => {
        if (recognizer) {
          recognizer.close();
        }
        if (pushStream) {
          pushStream.close();
        }
      };

      recognizer.startContinuousRecognitionAsync();
      setTimeout(() => {
        recognizer.stopContinuousRecognitionAsync();
      }, 10000);
    });
  } catch (error) {
    throw new Error(`Speech assessment error: ${error.message}`);
  }
}

export const speechConfig = {
  key: process.env.AZURE_SPEECH_KEY,
  region: process.env.AZURE_SPEECH_REGION,
  endpoint: process.env.AZURE_SPEECH_ENDPOINT,
};