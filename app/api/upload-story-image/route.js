// app/api/upload-story-image/route.js
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  const formData = await request.formData();
  const image = formData.get("image");

  if (!image) {
    return Response.json({ success: false, error: "No image provided" });
  }

  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  try {
    const buffer = await image.arrayBuffer();
    const filename = `story-images/${uuidv4()}.png`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: filename,
        Body: Buffer.from(buffer),
        ContentType: "image/png",
        ACL: 'public-read',
      })
    );

    const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;

    return Response.json({ success: true, imageUrl });
  } catch (error) {
    console.error("S3 upload error:", error);
    return Response.json({ success: false, error: "Failed to upload image" });
  }
}