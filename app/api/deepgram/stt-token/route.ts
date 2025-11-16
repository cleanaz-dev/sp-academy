
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { targetLanguage } = await request.json();
    
    // In development: Use your API key directly
    // In production: Create temporary scoped keys
    const apiKey = process.env.DEEPGRAM_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Deepgram API key not configured' }, 
        { status: 500 }
      );
    }

    // Return the API key as token (Deepgram SDK handles auth)
    return NextResponse.json({ 
      token: apiKey,
      // Optional: Add expiry for production
      expiresAt: Date.now() + 3600000 // 1 hour
    });
    
  } catch (error) {
    console.error('STT token error:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' }, 
      { status: 500 }
    );
  }
}