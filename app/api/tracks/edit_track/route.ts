import { NextRequest, NextResponse } from "next/server";
import { User as Decoded } from "@/libs/Auth";
import prisma from "@/libs/prisma";
import crypto from "crypto";
import {
  DeleteObjectCommand,
  PutObjectAclCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function PATCH(req: NextRequest) {
  try {
    // Parse form data using Next.js 14's native formData()
    const { id, name, artist, fileType, fileSize, uploaded, newKey, oldKey } =
      await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Missing required parameter: id" },
        { status: 400 }
      );
    }

    // Authorization check
    const user = await Decoded();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    // Find track and validate ownership
    const track = await prisma.track.findUnique({ where: { id } });
    if (!track) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    if (track.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized to edit this track" },
        { status: 403 }
      );
    }

    if (!uploaded) {
      // Update track metadata
      if (name) track.name = name;
      if (artist) track.artist = artist;

      // Handle art upload if present
      const imageKey = crypto.randomBytes(8).toString("hex");
      if (fileType && fileSize) {
        const command = new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: `images/track/${imageKey}`,
          ContentType: fileType,
        });

        const url = await getSignedUrl(s3Client, command, {
          expiresIn: 3600,
        });

        if (!url) {
          return NextResponse.json(
            { error: "image url not generated" },
            { status: 500 }
          );
        }
        return NextResponse.json({ url, imageKey: imageKey }, { status: 200 });
      }

      if (name) track.name = name;
      if (artist) track.artist = artist;
      await prisma.track.update({ where: { id }, data: { name, artist } });

      return NextResponse.json(
        { message: "Successfully updated" },
        { status: 200 }
      );
    } else {
      if (oldKey) {
        const command = new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: `images/track/${oldKey}`,
        });
        await s3Client.send(command);
      }
      // Update track metadata even when uploaded is true
      if (name) track.name = name;
      if (artist) track.artist = artist;
      await prisma.track.update({ where: { id }, data: { name, artist, image: newKey } });
    }

    return NextResponse.json(
      { message: "Successfully updated" },
      { status: 200 }
    );

    // Validate required fields
  } catch (error) {
    console.error("Error updating track:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
