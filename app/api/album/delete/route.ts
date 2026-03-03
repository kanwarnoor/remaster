import { NextRequest, NextResponse } from "next/server";
import { User as Decoded } from "@/libs/Auth";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import prisma from "@/libs/prisma";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function DELETE(req: NextRequest) {
  const user = await Decoded();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "No id provided" }, { status: 400 });
  }

  try {
    const album = await prisma.album.findUnique({ where: { id } });

    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    if (album.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized to delete this album" }, { status: 403 });
    }

    // Disconnect all tracks from the album before deleting
    await prisma.track.updateMany({
      where: { albumId: id },
      data: { albumId: null },
    });

    // Delete album image from S3 if it exists
    if (album.image) {
      try {
        const command = new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME || "",
          Key: `images/track/${album.image}`,
        });
        await s3Client.send(command);
      } catch (s3Error) {
        console.error("Failed to delete album image from S3:", s3Error);
      }
    }

    await prisma.album.delete({ where: { id } });

    return NextResponse.json({ message: "Album deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting album:", error);
    return NextResponse.json({ error: "Failed to delete album" }, { status: 500 });
  }
}