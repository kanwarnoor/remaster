import { NextRequest, NextResponse } from "next/server";
import { User as Decoded } from "@/libs/Auth";
import connectDb from "@/libs/connectDb";
import Track from "@/models/Track";
import {
  PutObjectAclCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import TracksList from "@/app/components/TracksList";

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
    const { id, name, artist, fileType, fileSize, uploaded } = await req.json();

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

    await connectDb();

    // Find track and validate ownership
    const track = await Track.findById(id);
    if (!track) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    if (track.user.toString() !== user._id.toString()) {
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

      let url = null;
      if (fileType && fileSize) {
        const command = new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: `images/track/${track.s3Key}`,
          ContentType: fileType,
        });
  
         url = await getSignedUrl(s3Client, command, {
          expiresIn: 3600,
        });
        if (!url) {
          return NextResponse.json(
            { error: "image url not generated" },
            { status: 500 }
          );
        }
      }

      await track.save();

      return NextResponse.json({ url }, { status: 200 });
    } else {
      track.art = `https://${AWS_BUCKET_NAME}.s3.amazonaws.com/images/track/${track.s3Key}`;
      await track.save();
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
