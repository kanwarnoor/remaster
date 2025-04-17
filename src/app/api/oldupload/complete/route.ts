import { NextResponse } from "next/server";
import { User as Decoded } from "@/libs/Auth";
import User from "@/models/User";
import Track from "@/models/Track";
import connectDb from "@/libs/connectDb";
import { CompleteMultipartUploadCommand, S3Client } from "@aws-sdk/client-s3";

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

    const { uploadId, key, parts } = await req.json();

    if (!uploadId || !key || !parts || !Array.isArray(parts)) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const completeCommand = new CompleteMultipartUploadCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts,
      },
    });

    const response = await s3Client.send(completeCommand);

    return NextResponse.json(
      { message: "Upload completed successfully", response },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Detailed error:",
      error instanceof Error ? error.stack : String(error)
    );
    return NextResponse.json(
      { error: "Failed to complete upload" },
      { status: 500 }
    );
  }
}
