// /api/upload/init.ts
import { NextRequest, NextResponse } from "next/server";
import { User as Decoded } from "@/libs/Auth";
import {
  CreateMultipartUploadCommand,
  S3Client,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import crypto from "crypto";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const bucketName = process.env.AWS_BUCKET_NAME || "";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const MAX_SIZE = 100 * 1024 * 1024; // 100 MB
const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  try {
    const user = await Decoded();
    if (!user) {
      return NextResponse.json(
        { error: "Please login to upload!" },
        { status: 401 }
      );
    }

    const { type, size } = await req.json();

    if (!type.startsWith("audio/")) {
      return NextResponse.json(
        { error: "Invalid file type. Only audio files are allowed." },
        { status: 400 }
      );
    }

    if (size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds the maximum limit of 100 MB" },
        { status: 400 }
      );
    }

    const chunkCount = Math.ceil(size / CHUNK_SIZE);
    const name = `${crypto.randomBytes(8).toString("hex")}`;

    // Initialize multipart upload
    const multipartUpload = new CreateMultipartUploadCommand({
      Bucket: bucketName,
      Key: `audio/${name}`,
      ContentType: type,
    });

    const { UploadId } = await s3Client.send(multipartUpload);
    if (!UploadId) {
      return NextResponse.json(
        { error: "Failed to initiate multipart upload" },
        { status: 500 }
      );
    }

    const presignedUrls = [];

    for (let partNumber = 1; partNumber <= chunkCount; partNumber++) {
      const uploadPartCommand = new UploadPartCommand({
        Bucket: bucketName,
        Key: `audio/${name}`,
        PartNumber: partNumber,
        UploadId: UploadId,
      });

      const url = await getSignedUrl(s3Client, uploadPartCommand, {
        expiresIn: 3600,
      });

      presignedUrls.push({
        url,
        partNumber,
      });
    }

    return NextResponse.json(
      { urls: presignedUrls, uploadId: UploadId, key: name },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Detailed error:",
      error instanceof Error ? error.stack : String(error)
    );
    return NextResponse.json(
      { error: "Failed to initiate multipart upload" },
      { status: 500 }
    );
  }
}
