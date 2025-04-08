// lib/storage.js
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function uploadAudio(audioBuffer, filename) {
  try {
    console.log("Starting S3 upload for:", filename);

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `audio/${filename}`,
      Body: audioBuffer,
      ContentType: "audio/wav",
    });

    await s3Client.send(command);

    const audioUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/audio/${filename}`;
    console.log("Upload successful, URL:", audioUrl);

    return audioUrl;
  } catch (error) {
    console.error("S3 upload error:", error);
    throw error;
  }
}

export async function uploadAudioToS3(audioFile, fileName) {
  try {
    console.log("Starting audio upload and conversion...");

    if (!(audioFile instanceof File || audioFile instanceof Blob)) {
      throw new Error("Invalid audio file format");
    }

    // Initialize FFmpeg
    const ffmpeg = new FFmpeg();
    await ffmpeg.load();

    // Convert audio to correct format
    console.log("Converting audio format...");
    const inputData = await fetchFile(audioFile);
    await ffmpeg.writeFile("input.webm", inputData);

    // FFmpeg command to convert to correct WAV format
    await ffmpeg.exec([
      "-i",
      "input.webm",
      "-acodec",
      "pcm_s16le", // 16-bit PCM
      "-ar",
      "16000", // 16kHz sample rate
      "-ac",
      "1", // Mono channel
      "-f",
      "wav", // WAV format
      "output.wav",
    ]);

    // Read the converted file
    const data = await ffmpeg.readFile("output.wav");
    const buffer = Buffer.from(data);

    console.log("Audio conversion completed. File size:", buffer.length);

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "");
    const audioFileName = `${timestamp}-${randomString}-${sanitizedFileName}`;

    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `audio/${audioFileName}`,
      Body: buffer,
      ContentType: "audio/wav",
      ACL: "public-read",
      Metadata: {
        "audio-format": "wav",
        "sample-rate": "16000",
        channels: "1",
        "bit-depth": "16",
      },
    };

    console.log("Audio upload params:", {
      Bucket: uploadParams.Bucket,
      Key: uploadParams.Key,
      ContentType: uploadParams.ContentType,
      FileSize: buffer.length,
      Format: "WAV 16kHz Mono",
    });

    const command = new PutObjectCommand(uploadParams);
    const result = await s3Client.send(command);

    console.log("S3 audio upload completed:", result);

    const audioUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/audio/${audioFileName}`;

    // Cleanup FFmpeg files
    await ffmpeg.deleteFile("input.webm");
    await ffmpeg.deleteFile("output.wav");

    return {
      key: `audio/${audioFileName}`,
      url: audioUrl,
      fileName: audioFileName,
      format: "WAV 16kHz Mono PCM",
    };
  } catch (error) {
    console.error("Audio upload error:", {
      message: error.message,
      code: error.code,
      requestId: error.$metadata?.requestId,
      stack: error.stack,
    });
    throw error;
  }
}
