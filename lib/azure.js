import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import axios from 'axios';
import fs from 'fs';
import { promisify } from 'util';
import path from 'path';
import os from 'os';

let recognizer = null;
let audioConfig = null;
const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);

export async function performPronunciationAssessment(audioUrl, referenceText) {
  try {
    // Download audio file
    const tempFilePath = await downloadAudio(audioUrl);
    
    // Configure speech services
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY,
      process.env.AZURE_SPEECH_REGION
    );
    
    // Create audio config from file
    audioConfig = sdk.AudioConfig.fromWavFileInput(tempFilePath);
    
    // Create pronunciation assessment config
    const pronunciationAssessmentConfig = new sdk.PronunciationAssessmentConfig(
      referenceText,
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.Word,
      true
    );

    return new Promise((resolve, reject) => {
      recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
      pronunciationAssessmentConfig.applyTo(recognizer);

      recognizer.recognized = async (s, e) => {
        if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
          const pronunciationResult = sdk.PronunciationAssessmentResult.fromResult(e.result);
          
          recognizer.stopContinuousRecognitionAsync(() => {
            resolve({
              recognizedText: e.result.text,
              pronunciationResult: pronunciationResult
            });
          });
        }
      };

      recognizer.canceled = (s, e) => {
        console.log(`CANCELED: Reason=${e.reason}`);
        if (e.reason === sdk.CancellationReason.Error) {
          console.log(`CANCELED: ErrorCode=${e.errorCode}`);
          console.log(`CANCELED: ErrorDetails=${e.errorDetails}`);
        }
        reject(new Error(e.errorDetails || 'Recognition canceled'));
      };

      recognizer.startContinuousRecognitionAsync();
    });
  } catch (error) {
    throw new Error(`Pronunciation assessment failed: ${error.message}`);
  }
}

async function downloadAudio(audioUrl) {
  try {
    const response = await axios({
      url: audioUrl,
      method: 'GET',
      responseType: 'arraybuffer'
    });

    const tempFilePath = path.join(os.tmpdir(), `audio-${Date.now()}.wav`);
    await writeFileAsync(tempFilePath, response.data);
    return tempFilePath;
  } catch (error) {
    throw new Error(`Failed to download audio: ${error.message}`);
  }
}

export async function cleanup() {
  try {
    if (recognizer) {
      recognizer.close();
    }
    if (audioConfig) {
      audioConfig.close();
    }
    
    // Clean up temporary files
    const tempDir = os.tmpdir();
    const files = await fs.promises.readdir(tempDir);
    
    for (const file of files) {
      if (file.startsWith('audio-') && file.endsWith('.wav')) {
        await unlinkAsync(path.join(tempDir, file));
      }
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

export function formatAssessmentResults(assessment) {
  const { recognizedText, pronunciationResult } = assessment;
  
  return {
    recognizedText,
    accuracyScore: pronunciationResult.accuracyScore,
    pronunciationScore: pronunciationResult.pronunciationScore,
    completenessScore: pronunciationResult.completenessScore,
    fluencyScore: pronunciationResult.fluencyScore,
    words: pronunciationResult.detailResult.Words.map(word => ({
      word: word.Word,
      accuracyScore: word.AccuracyScore,
      errorType: word.ErrorType
    }))
  };
}