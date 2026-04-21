import { NextResponse, NextRequest } from "next/server";
import { User as Decoded } from "@/libs/Auth";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import prisma from "@/libs/prisma";

const s3Client = new S3Client({
  region: process.env.A_REGION || "",
  credentials: {
    accessKeyId: process.env.A_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.A_SECRET_ACCESS_KEY || "",
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
    const track = await prisma.track.findUnique({ where: { id } });

    if (!track) {
      return NextResponse.json({ message: "Track not found" }, { status: 404 });
    }

    if (track.userId !== user.id) {
      return NextResponse.json(
        { error: "You are not authorized to delete this track" },
        { status: 403 }
      );
    }

    // Delete the file from S3
    if (track.audio) {
      try {
        const deleteParams = {
          Bucket: process.env.A_BUCKET_NAME || "",
          Key: `audio/${track.audio}`,
        };
        const command = new DeleteObjectCommand(deleteParams);
        await s3Client.send(command);
        console.log(`File deleted from S3: ${track.audio}`);
      } catch (s3Error) {
        console.error(`Failed to delete file from S3: ${s3Error}`);
      }
    }

    // Delete the art from S3
    if (track.image) {
      try {
        const deleteParams = {
          Bucket: process.env.A_BUCKET_NAME || "",
          Key: `images/track/${track.image}`,
        };
        const command = new DeleteObjectCommand(deleteParams);
        await s3Client.send(command);
        console.log(`File deleted from S3: ${track.image}`);
      } catch (s3Error) {
        console.error(`Failed to delete file from S3: ${s3Error}`);
      }
    }

    await prisma.playlistTracks.deleteMany({ where: { trackId: id } });
    await prisma.albumTracks.deleteMany({ where: { trackId: id } });

    const deletedTrack = await prisma.track.delete({ where: { id } });

    if (!deletedTrack) {
      return NextResponse.json({ message: "Track not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Track deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete track", error);
    return NextResponse.json(
      { error: "Failed to delete track" },
      { status: 500 }
    );
  }
}