// app/api/upload-assessment-audio/route.js
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from 'next/server';

// Configure S3 client server-side
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(req) {
  try {
    // Get the audio file from the request
    const formData = await req.formData();
    const audioFile = formData.get('audio');
    const storyId = formData.get('storyId');

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file uploaded' }, { status: 400 });
    }

    // Convert File to Buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const sanitizedFileName = `story-${storyId}.wav`.replace(/[^a-zA-Z0-9.-]/g, '');
    const audioFileName = `${timestamp}-${randomString}-${sanitizedFileName}`;

    // Upload parameters
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `audio/${audioFileName}`,
      Body: buffer,
      ContentType: audioFile.type || 'audio/wav',
      ACL: 'public-read',
    };

    // Perform S3 upload
    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    // Construct audio URL
    const audioUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/audio/${audioFileName}`;

    return NextResponse.json({
      success: true,
      url: audioUrl,
      fileName: audioFileName,
    });

  } catch (error) {
    console.error('S3 upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload audio', details: error.message },
      { status: 500 }
    );
  }
}