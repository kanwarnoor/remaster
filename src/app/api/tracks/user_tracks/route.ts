import { NextRequest, NextResponse } from "next/server";

import { User as Decoded } from "@/libs/Auth";
import Track from "@/models/Track";
import connectDb from "@/libs/connectDb";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function GET(req: NextRequest) {
  const user = await Decoded();

  if (user == null) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDb();

    const tracks = await Track.find({ user: user._id });

    if (!tracks) {
      return NextResponse.json({ error: "No tracks found" }, { status: 404 });
    }

    // let imageUrls: string[] = [];

    // try {
    //   const urls = await Promise.all(
    //     tracks.map(async (track) => {
    //       const command = new GetObjectCommand({
    //         Bucket: process.env.AWS_BUCKET_NAME,
    //         Key: `images/track/${track.s3Key}`,
    //       });
    
    //       const url = await getSignedUrl(s3Client, command, {
    //         expiresIn: 3600,
    //       });
    
    //       return url;
    //     })
    //   );
    
    //   imageUrls = urls;
    // } catch (error) {
    //   console.error("Error generating signed URLs: ", error);
    // }

    return NextResponse.json({ tracks }, { status: 200 });
  } catch (error) {
    console.error("Error fetching tracks: ", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
