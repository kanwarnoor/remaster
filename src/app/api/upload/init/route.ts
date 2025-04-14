import { NextRequest, NextResponse } from "next/server";
import { User as Decoded } from "@/libs/Auth";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

const bucketName = process.env.AWS_BUCKET_NAME || "";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function POST(req: NextRequest) {
  try {
    const user = await Decoded();
    if (!user) {
      return NextResponse.json(
        { error: "Please login to upload!" },
        { status: 401 }
      );
    }

    const { fileName, type, size } = await req.json();

    const name = `${user.username}-${crypto.randomBytes(8).toString("hex")}`;

    const url = await getSignedUrl(
      s3Client,
      new PutObjectCommand({
        Bucket: bucketName,
        Key: `audio/${name}`,
        ContentType: type,
      }),
      { expiresIn: 3600 }
    );

    return NextResponse.json({ url, name }, { status: 200 });
  } catch (error) {
    console.error(
      "Detailed error:",
      error instanceof Error ? error.stack : String(error)
    );
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
