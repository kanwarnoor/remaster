import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const A_BUCKET_NAME = process.env.A_BUCKET_NAME || "";

const s3Client = new S3Client({
  region: process.env.A_REGION || "",
  credentials: {
    accessKeyId: process.env.A_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.A_SECRET_ACCESS_KEY || "",
  },
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const s3Key = searchParams.get("s3key");

  if (!s3Key) {
    return NextResponse.json({ error: "No s3key provided" }, { status: 400 });
  }

  try {
    const url = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: A_BUCKET_NAME,
        Key: `audio/${s3Key}`,
      }),
      { expiresIn: 3600 },
    );

    return NextResponse.redirect(url, 302);
  } catch (error) {
    console.error("Error signing audio URL:", error);
    return NextResponse.json(
      { error: "Failed to sign audio URL" },
      { status: 500 },
    );
  }
}
