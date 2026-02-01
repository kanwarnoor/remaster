import { NextResponse } from "next/server";
import { User as Decoded } from "@/libs/Auth";
import prisma from "@/libs/prisma";
import crypto from "crypto";
import {
  CompleteMultipartUploadCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME || "";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function POST(req: Request) {
  const { key, uploadId, parts, type, metadata, fileName, size } =
    await req.json();

  try {
    const user = await Decoded();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log(user);

    if (!key || !uploadId || !parts || !Array.isArray(parts) || !type) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const completeCommand = new CompleteMultipartUploadCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: `audio/${key}`,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts,
      },
    });

    await s3Client.send(completeCommand);

    const { common, format } = metadata;
    const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, "");

    let artKey = null;
    if (common.picture && common.picture[0]) {
      const art = common.picture[0];
      try {
        if (art.data && art.format) {
          const artBuffer =
            Buffer.isBuffer(art.data) || art.data instanceof Uint8Array
              ? Buffer.from(art.data)
              : Buffer.from(
                  new Uint8Array(Object.values(art.data) as number[])
                );

          artKey = `${crypto.randomBytes(8).toString("hex")}`;
          await s3Client.send(
            new PutObjectCommand({
              Bucket: AWS_BUCKET_NAME,
              Key: `images/track/${artKey}`,
              Body: artBuffer,
              ContentType: art.format,
              CacheControl: "public, max-age=31536000",
              ACL: "private",
            })
          );
        }
      } catch (error) {
        console.error("Error uploading cover art:", error);
        // Continue without cover art if there's an error
      }
    }

    const track = await prisma.track.create({
      data: {
        userId: user.id,
        name: common.title || nameWithoutExtension,
        artist: common.artist || user.username,
        size: size,
        duration: format.duration || 0,
        audio: key,
        image: artKey,
      },
    });

    // await prisma.user.update({ where: { id: user.id }, data: { tracks: { connect: { id: track.id } } } });

    return NextResponse.json(
      { message: "File uploaded successfully!", trackId: track.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving file:", error);
    return NextResponse.json(
      { error: "Failed to upload file", details: (error as Error).message },
      { status: 500 }
    );
  }
}
