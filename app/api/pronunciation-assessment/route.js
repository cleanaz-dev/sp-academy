// app/api/pronunciation-assessment/route.js
import { NextResponse } from 'next/server';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio');
    const referenceText = formData.get('referenceText');
    const language = formData.get('language') || 'en-US';

    if (!audioFile || !referenceText) {
      return NextResponse.json(
        { error: 'Missing audio or reference text' },
        { status: 400 }
      );
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const audioData = Buffer.from(arrayBuffer);

    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY,
      process.env.AZURE_SPEECH_REGION
    );
    
    speechConfig.speechRecognitionLanguage = language;

    const pushStream = sdk.AudioInputStream.createPushStream();
    
    // Write audio data in chunks
    const chunkSize = 32000;
    for (let i = 0; i < audioData.length; i += chunkSize) {
      const chunk = audioData.slice(i, Math.min(i + chunkSize, audioData.length));
      pushStream.write(chunk);
    }
    pushStream.close();

    const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);

    const pronunciationAssessmentConfig = new sdk.PronunciationAssessmentConfig(
      referenceText,
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.Phoneme,
      true
    );

    pronunciationAssessmentConfig.enableProsodyAssessment = true;
    pronunciationAssessmentConfig.enableSyllableAssessment = true;

    return new Promise((resolve, reject) => {
      const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
      
      pronunciationAssessmentConfig.applyTo(recognizer);

      let resultReceived = false;

      recognizer.recognized = (s, e) => {
        if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
          resultReceived = true;
          const pronunciationResult = sdk.PronunciationAssessmentResult.fromResult(e.result);
          
          // Calculate speaking rate
          const durationInSeconds = e.result.duration / 10000000; // Convert ticks to seconds
          const wordCount = pronunciationResult.detailResult.Words.length;
          const wordsPerMinute = (wordCount / durationInSeconds) * 60;
          
          const speakingRate = 
            wordsPerMinute < 100 ? 'slow' :
            wordsPerMinute > 160 ? 'fast' :
            'optimal';

          // Extract word-level details with syllables
          const words = pronunciationResult.detailResult.Words.map(word => ({
            word: word.Word,
            accuracyScore: word.PronunciationAssessment.AccuracyScore,
            errorType: word.PronunciationAssessment.ErrorType,
            duration: word.Duration,
            offset: word.Offset,
            syllables: word.Syllables?.map(s => ({
              syllable: s.Syllable,
              accuracyScore: s.PronunciationAssessment?.AccuracyScore,
              duration: s.Duration
            }))
          }));

          resolve(NextResponse.json({
            recognizedText: e.result.text,
            accuracyScore: pronunciationResult.accuracyScore,
            pronunciationScore: pronunciationResult.pronunciationScore,
            completenessScore: pronunciationResult.completenessScore,
            fluencyScore: pronunciationResult.fluencyScore,
            prosodyScore: pronunciationResult.prosodyScore,
            words: words,
            speakingRate: speakingRate,
            duration: durationInSeconds,
            wordsPerMinute
          }));
        }
      };

      recognizer.canceled = (s, e) => {
        if (!resultReceived) {
          resolve(NextResponse.json({
            error: e.errorDetails || 'No speech recognized'
          }, { status: 400 }));
        }
      };

      recognizer.startContinuousRecognitionAsync(
        () => {
          setTimeout(() => {
            if (!resultReceived) {
              recognizer.stopContinuousRecognitionAsync();
            }
          }, 10000); // Stop after 10 seconds maximum
        },
        (error) => {
          reject(error);
        }
      );
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}