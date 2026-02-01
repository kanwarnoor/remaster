import { NextResponse } from "next/server";
import { User } from "@/libs/Auth";
import prisma from "@/libs/prisma";

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Track ID is required", { status: 400 }); // should be 400 for missing ID
  }

  const user = await User();

  try {
    const track = await prisma.track.findUnique({ where: { id } });
    if (!track) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }
    const isOwner = !!user && track.userId === user.id;

    if (track.visibility === "PRIVATE" && !isOwner) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // get the signed URL for the track image
    // const command = new GetObjectCommand({
    //   Bucket: AWS_BUCKET_NAME,
    //   Key: `images/track/${track.s3Key}`,
    // });

    // const artUrl = await getSignedUrl(s3Client, command, {
    //   expiresIn: 3600,
    // });

    return NextResponse.json({ track }, { status: 200 });
  } catch (error) {
    console.error("Error loading track:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
