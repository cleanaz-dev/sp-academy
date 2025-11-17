import { PutObjectCommand, s3Client } from "@/lib/aws";
import { v4 as uuidv4 } from "uuid";

export async function uploadAudioToS3Bucket(
  audioBuffer: Buffer,
  fileNameParam?: string,
  contentType: string = "audio/mpeg",
): Promise<string> {
  try {
    if (!audioBuffer) {
      throw new Error("No audio data provided");
    }

    // Use the provided file name or generate a new one
    const fileName = fileNameParam || `sound-effects/${uuidv4()}.mp3`;

    // Upload directly using the provided buffer
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.SPOONFED_AUDIO_BUCKET_NAME,
        Key: fileName,
        Body: audioBuffer,
        ContentType: contentType,
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