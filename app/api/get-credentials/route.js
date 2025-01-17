// app/api/get-credentials/route.js
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
    
    return NextResponse.json({
      credentials,
      region: process.env.AWS_REGION || 'us-east-1'
    });
  } catch (error) {
    console.error('Error getting credentials:', error);
    return NextResponse.json({ error: 'Failed to get credentials' }, { status: 500 });
  }
}