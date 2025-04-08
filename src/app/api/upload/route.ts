import { NextRequest, NextResponse } from "next/server";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { User as Decoded } from "@/libs/Auth";
import User from "@/models/User";
import Track from "@/models/Track";
import { Buffer } from "buffer";
import path from "path";

const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME || "";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
})

export async function POST(req: NextRequest) {
  try {
    const user = await Decoded();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("audio/")) {
      return NextResponse.json(
        { error: "File must be audio" },
        { status: 400 }
      );
    }

    const fileExt = path.extname(file.name); // safer than split('.')
    const timestamp = Date.now();
    const fileName = `${user.username}-${timestamp}${fileExt}`;
    const s3Key = `audio/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: AWS_BUCKET_NAME,
        Key: s3Key,
        Body: buffer,
        ContentType: file.type,
        CacheControl: "public, max-age=31536000", // encourage caching
        ACL: "private", // or "public-read" depending on your use-case
      })
    );

    // Generate a signed GET URL for playback or download
    const getObjectCommand = new GetObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: s3Key,
    });

    const url = await getSignedUrl(s3Client, getObjectCommand, {
      expiresIn: 3600,
    });

    // Save metadata to DB
    const track = await Track.create({
      user: user._id,
      name: file.name,
      artist: user.username,
      size: file.size,
      s3Key,
    });

    await User.updateOne({ _id: user._id }, { $push: { tracks: track._id } });

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      file: {
        name: file.name,
        type: file.type,
        size: file.size,
        url,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({
      error: "Failed to upload file!",
      details: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    });
  }
}
