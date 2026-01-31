import { User as Decoded } from "@/libs/Auth";
import { NextResponse } from "next/server";

import { S3Client, AbortMultipartUploadCommand } from "@aws-sdk/client-s3";

const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME || "";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function POST(req: Request) {
  try {
    const user = await Decoded();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { uploadId, key } = await req.json();

    if (!uploadId || !key) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const abortCommand = new AbortMultipartUploadCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: `audio/${key}`,
      UploadId: uploadId,
    });

    await s3Client.send(abortCommand);

    return NextResponse.json(
      { message: "Upload aborted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Detailed error:",
      error instanceof Error ? error.stack : String(error)
    );
    return NextResponse.json(
      { error: "Failed to abort upload" },
      { status: 500 }
    );
  }
}
