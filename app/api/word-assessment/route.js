// app/api/word-assessment/route.js

import { NextResponse } from 'next/server';
import { performSpeechAssessment } from '@/lib/azure';

export async function POST(request) {
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

    const result = await performSpeechAssessment(audioData, referenceText, language);
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}