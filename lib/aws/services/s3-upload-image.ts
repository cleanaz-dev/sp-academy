import { s3Client, PutObjectCommand } from "@/lib/aws";
import { v4 as uuidv4 } from "uuid";

// ==========================================
// EXISTING FUNCTION (Kept as-is for elsewhere)
// ==========================================
export async function uploadImage(imageUrl: string) {
  try {
    if (!imageUrl) throw new Error("No image URL provided");

    const imageResponse = await fetch(imageUrl, {
      method: "GET",
      headers: { Accept: "image/*" },
    });

    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }

    const imageData = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(imageData);
    const filename = `lessons/${uuidv4()}.png`;

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

// ==========================================
// NEW PRIVATE FUNCTION (Returns S3 Key)
// ==========================================
export async function uploadImagePrivate(imageUrl: string) {
  try {
    if (!imageUrl) throw new Error("No image URL provided");

    // 1. Download image from the provided URL
    const imageResponse = await fetch(imageUrl, {
      method: "GET",
      headers: { Accept: "image/*" },
    });

    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }

    const imageData = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(imageData);
    const filename = `lessons/${uuidv4()}.png`;

    // 2. Upload to S3 WITHOUT the public-read ACL
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: filename,
        Body: buffer,
        ContentType: "image/png",
        // NOTE: ACL is omitted so the object remains PRIVATE
      }),
    );

    console.log("Successfully uploaded private image to S3. Key:", filename);

    // 3. Return ONLY the S3 Key (e.g., "lessons/uuid.png")
    return filename; 
  } catch (error) {
    console.error("Error uploading private image to S3:", error);
    throw error;
  }
}

