// lib/uploadAudio.js
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

export async function uploadAudioToS3Bucket(
  audioBuffer,
  fileNameParam,
  contentType = "audio/mpeg",
) {
  try {
    if (!audioBuffer) {
      throw new Error("No audio data provided");
    }

    // Use the provided file name or generate a new one
    const fileName = fileNameParam || `sound-effects/${uuidv4()}.mp3`;

    // Initialize S3 client
    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    // Upload directly using the provided buffer
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.SPOONFED_AUDIO_BUCKET_NAME,
        Key: fileName,
        Body: audioBuffer,
        ContentType: contentType, // for audio, use 'audio/mpeg' or the appropriate MIME type
        ACL: "public-read",
      }),
    );

    const uploadedAudioUrl = `https://${process.env.SPOONFED_AUDIO_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    console.log("Successfully uploaded to S3:", uploadedAudioUrl);

    return uploadedAudioUrl;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
}
