import { NextRequest, NextResponse } from "next/server";
import { User as Decoded } from "@/libs/Auth";
import prisma from "@/libs/prisma";
import crypto from "crypto";
import {
  DeleteObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function PATCH(req: NextRequest) {
  try {
    const { id, name, artist, fileType, fileSize, uploaded, newKey, oldKey } =
      await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing required parameter: id" }, { status: 400 });
    }

    const user = await Decoded();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const album = await prisma.album.findUnique({ where: { id } });
    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    if (album.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized to edit this album" }, { status: 403 });
    }

    if (!uploaded) {
      // If an image file is being uploaded, return a presigned S3 URL
      if (fileType && fileSize) {
        const imageKey = crypto.randomBytes(8).toString("hex");
        const command = new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: `images/track/${imageKey}`,
          ContentType: fileType,
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        if (!url) {
          return NextResponse.json({ error: "Image URL not generated" }, { status: 500 });
        }

        return NextResponse.json({ url, imageKey }, { status: 200 });
      }

      // No image — just update name/artist
      await prisma.album.update({ where: { id }, data: { name, artist } });
      return NextResponse.json({ message: "Successfully updated" }, { status: 200 });
    } else {
      // Image was uploaded to S3 — delete old image and save new key
      if (oldKey) {
        try {
          const command = new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `images/track/${oldKey}`,
          });
          await s3Client.send(command);
        } catch (s3Error) {
          console.error("Failed to delete old album image from S3:", s3Error);
        }
      }

      await prisma.album.update({ where: { id }, data: { name, artist, image: newKey } });
      return NextResponse.json({ message: "Successfully updated" }, { status: 200 });
    }
  } catch (error) {
    console.error("Error updating album:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
