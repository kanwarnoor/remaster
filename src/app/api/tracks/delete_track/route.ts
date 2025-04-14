import { NextResponse, NextRequest } from "next/server";
import { loggedIn } from "@/libs/Auth";
import Track from "@/models/Track";
import User from "@/models/User";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import connectDb from "@/libs/connectDb";
import TracksList from "@/app/components/TracksList";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function DELETE(req: NextRequest) {
  const login = await loggedIn();

  if (!login) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "No id provided" }, { status: 400 });
  }

  try {
    await connectDb();
    const track = await Track.findById(id);

    if (!track) {
      return NextResponse.json({ message: "Track not found" }, { status: 404 });
    }

    // Delete the file from S3
    if (track.s3Key) {
      try {
        const deleteParams = {
          Bucket: process.env.AWS_BUCKET_NAME || "",
          Key: `audio/${track.s3Key}`,
        };
        const command = new DeleteObjectCommand(deleteParams);
        await s3Client.send(command);
        console.log(`File deleted from S3: ${track.s3Key}`);
      } catch (s3Error) {
        console.error(`Failed to delete file from S3: ${s3Error}`);
      }
    }

    // Delete the art from S3
    if (track.art) {
      try {
        const deleteParams = {
          Bucket: process.env.AWS_BUCKET_NAME || "",
          Key: `images/track/${track.s3Key}`,
        };
        const command = new DeleteObjectCommand(deleteParams);
        await s3Client.send(command);
        console.log(`File deleted from S3: ${track.art}`);
      } catch (s3Error) {
        console.error(`Failed to delete file from S3: ${s3Error}`);
      }
    }

    const deletedTrack = await Track.deleteOne({ _id: id });

    if (!deletedTrack) {
      return NextResponse.json({ message: "Track not found" }, { status: 404 });
    }

    await User.updateOne({ tracks: id }, { $pull: { tracks: id } });

    return NextResponse.json(
      { message: "Track deleted successfully" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to delete track" },
      { status: 500 }
    );
  }
}
