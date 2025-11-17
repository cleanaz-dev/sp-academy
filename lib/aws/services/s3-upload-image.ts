// lib/uploadImage.js
import { s3Client, PutObjectCommand } from "@/lib/aws";
import { v4 as uuidv4 } from "uuid";

export async function uploadImage(imageUrl: string) {
  try {
    if (!imageUrl) {
      throw new Error("No image URL provided");
    }

    // Download image from the provided URL
    const imageResponse = await fetch(imageUrl, {
      method: "GET",
      headers: {
        Accept: "image/*",
      },
    });

    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }

    // Get the binary image data
    const imageData = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(imageData);
    const filename = `lessons/${uuidv4()}.png`;

    // Upload to S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: filename,
        Body: buffer,
        ContentType: "image/png",
        ACL: "public-read",
      }),
    );

    const uploadedImageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
    console.log("Successfully uploaded to S3:", uploadedImageUrl);

    return uploadedImageUrl;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
}
