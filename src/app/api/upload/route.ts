import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { User as Decoded } from "@/libs/Auth";
import User from "@/models/User";
import Track from "@/models/Track";
import { Buffer } from "buffer";
import { parseBuffer } from "music-metadata";
import crypto from "crypto";

const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME || "";

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

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const metadata = await parseBuffer(buffer, file.type);

    if (!metadata) {
      return NextResponse.json(
        { error: "Failed to parse metadata" },
        { status: 400 }
      );
    }

    const { common, format } = metadata;

    const timestamp = Date.now();
    const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
    const randomBytes = crypto.randomBytes(8).toString("hex");
    const fileName = `${user.username}-${randomBytes}`;
    const s3Key = `audio/${fileName}`;

    // create a singed URL from aws s3
    // const signedUrl = await getSignedUrl(s3Client, new PutObjectCommand({
    //   Bucket: AWS_BUCKET_NAME,
    //   Key: s3Key,
    //   Body: buffer,
    //   ContentType: file.type,
    //   CacheControl: "public, max-age=31536000", // encourage caching
    //   ACL: "private", // or "public-read" depending on your use-case
    // }));


    // get and save the cover from image to s3.
    const art = common.picture?.[0];
    let coverUrl = null;
    if (art) {
      const artBuffer = Buffer.from(art.data);

      const artFileName = `${user.username}-${timestamp}-${
        common.title || nameWithoutExtension
      }-art`;
      const artS3Key = `images/${artFileName}`;

      await s3Client.send(
        new PutObjectCommand({
          Bucket: AWS_BUCKET_NAME,
          Key: artS3Key,
          Body: artBuffer,
          ContentType: art.format,
          CacheControl: "public, max-age=31536000", // encourage caching
          ACL: "private", // or "public-read" depending on your use-case
        })
      );

      coverUrl = `https://${AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${artS3Key}`;
    }

    // Save metadata to DB
    const track = await Track.create({
      user: user._id,
      name: common.title || nameWithoutExtension,
      artist: user.username,
      size: file.size,
      duration: format.duration || 0,
      album: null,
      s3Key: s3Key,
      art: coverUrl,
    });

    await User.updateOne({ _id: user._id }, { $push: { tracks: track._id } });

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
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
