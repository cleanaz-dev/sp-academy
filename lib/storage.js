// lib/storage.js
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function uploadAudio(audioBuffer, filename) {
  try {
    console.log('Starting S3 upload for:', filename);
    
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `audio/${filename}`,
      Body: audioBuffer,
      ContentType: 'audio/mpeg',
    });

    await s3Client.send(command);
    
    const audioUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/audio/${filename}`;
    console.log('Upload successful, URL:', audioUrl);
    
    return audioUrl;
  } catch (error) {
    console.error('S3 upload error:', error);
    return null;
  }
}