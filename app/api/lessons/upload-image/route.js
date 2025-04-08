// app/api/lessons/upload-image/route.js
import { auth } from "@clerk/nextjs/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

export async function POST(request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { imageUrl } = await request.json();
    console.log("Replicate Image url:", imageUrl);

    if (!imageUrl) {
      return Response.json({ success: false, error: "No image URL provided" });
    }

    // Download image from Replicate
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

    // Initialize S3 client
    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

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

    return Response.json({
      success: true,
      imageUrl: uploadedImageUrl,
    });
  } catch (error) {
    console.error("Error uploading to S3:", error);
    return Response.json({
      success: false,
      error: error.message,
    });
  }
}
