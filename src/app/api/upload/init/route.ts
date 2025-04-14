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
    console.log("AWS Setup", {
      region: process.env.AWS_REGION ? "✓" : "✗",
      bucketName: process.env.AWS_BUCKET_NAME ? "✓" : "✗",
      accessKey: process.env.AWS_ACCESS_KEY_ID ? "✓" : "✗",
      secretKey: process.env.AWS_SECRET_ACCESS_KEY ? "✓" : "✗"
    });

    const user = await Decoded();
    console.log("User auth:", user ? "Authenticated" : "Not authenticated");
    if (!user) {
      return NextResponse.json(
        { error: "Please login to upload!" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    const name = `${user.username}-${crypto.randomBytes(8).toString("hex")}`;
    console.log("File name:", name);

    if (!file) {
      return NextResponse.json({ error: "No file provided!" }, { status: 400 });
    }
    if (!file.type.startsWith("audio/")) {
      return NextResponse.json(
        { error: "File must be audio" },
        { status: 400 }
      );
    }

    const url = await getSignedUrl(
      s3Client,
      new PutObjectCommand({
        Bucket: bucketName,
        Key: `audio/${name}`,
        ContentType: file.type,
      }),
      { expiresIn: 3600 }
    );
    console.log("Signed URL:", url);

    return NextResponse.json(
      { url, name, fileName: file.name, type: file.type, size: file.size },
      { status: 200 }
    );
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
