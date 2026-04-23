import { NextRequest, NextResponse } from "next/server";
import { User as Decoded } from "@/libs/Auth";
import prisma from "@/libs/prisma";
import crypto from "crypto";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.A_REGION || "",
  credentials: {
    accessKeyId: process.env.A_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.A_SECRET_ACCESS_KEY || "",
  },
});

export async function PATCH(req: NextRequest) {
  try {
    const { username, fileType, fileSize, uploaded, newKey, oldKey } =
      await req.json();

    const user = await Decoded();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.user.findUnique({ where: { id: user.id } });
    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!uploaded) {
      if (username && username !== existing.username) {
        const taken = await prisma.user.findUnique({ where: { username } });
        if (taken && taken.id !== user.id) {
          return NextResponse.json(
            { error: "Username already taken" },
            { status: 409 }
          );
        }
      }

      if (fileType && fileSize) {
        const imageKey = crypto.randomUUID();
        const command = new PutObjectCommand({
          Bucket: process.env.A_BUCKET_NAME,
          Key: `images/user/${imageKey}`,
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

        if (username) {
          await prisma.user.update({
            where: { id: user.id },
            data: { username },
          });
        }

        return NextResponse.json({ url, imageKey }, { status: 200 });
      }

      if (username) {
        await prisma.user.update({
          where: { id: user.id },
          data: { username },
        });
      }

      return NextResponse.json(
        { message: "Successfully updated" },
        { status: 200 }
      );
    } else {
      if (oldKey) {
        const command = new DeleteObjectCommand({
          Bucket: process.env.A_BUCKET_NAME,
          Key: `images/user/${oldKey}`,
        });
        await s3Client.send(command);
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(username ? { username } : {}),
          image: newKey,
        },
      });

      return NextResponse.json(
        { message: "Successfully updated" },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
