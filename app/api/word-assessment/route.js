// app/api/word-assessment/route.js
import { NextResponse } from 'next/server';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

export async function POST(request) {
  let recognizer = null;
  let speechConfig = null;
  let audioConfig = null;
  let pushStream = null;

  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio');
    const referenceText = formData.get('referenceText');
    const language = formData.get('language') || 'en-US';

    // Debug log
    console.log('API Received:', {
      referenceText,
      language
    });

    if (!audioFile || !referenceText) {
      return NextResponse.json(
        { error: 'Missing audio or reference text' },
        { status: 400 }
      );
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const audioData = Buffer.from(arrayBuffer);

    speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY,
      process.env.AZURE_SPEECH_REGION
    );
    
    console.log('Language Setting:', language);
    speechConfig.speechRecognitionLanguage = language;

    pushStream = sdk.AudioInputStream.createPushStream();
    pushStream.write(audioData);
    pushStream.close();

    audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);

    const normalizedReferenceText = referenceText.toLowerCase().trim();
    
    // New simplified pronunciation assessment config
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
          
          // Normalize recognized text
          const normalizedRecognized = e.result.text.toLowerCase().replace(/[.,!?]/g, '').trim();
          
          // Debug log
          console.log('Azure Speech Results:', {
            recognizedText: e.result.text,
            normalizedRecognized,
            referenceText: normalizedReferenceText,
            match: normalizedRecognized === normalizedReferenceText,
            scores: {
              accuracy: pronunciationResult.accuracyScore,
              pronunciation: pronunciationResult.pronunciationScore,
              completeness: pronunciationResult.completenessScore,
              fluency: pronunciationResult.fluencyScore
            }
          });

          recognizer.stopContinuousRecognitionAsync(() => {
            cleanup();
            resolve(NextResponse.json({
              recognizedText: normalizedRecognized,
              accuracyScore: pronunciationResult.accuracyScore,
              pronunciationScore: pronunciationResult.pronunciationScore,
              completenessScore: pronunciationResult.completenessScore,
              fluencyScore: pronunciationResult.fluencyScore,
              match: normalizedRecognized === normalizedReferenceText
            }));
          });
        }
      };

      recognizer.canceled = (s, e) => {
        console.log('Recognition Canceled:', e.errorDetails);
        cleanup();
        resolve(NextResponse.json({
          error: e.errorDetails || 'Recognition canceled'
        }, { status: 400 }));
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
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}