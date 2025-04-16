import { NextResponse } from "next/server";
import { User as Decoded } from "@/libs/Auth";
import User from "@/models/User";
import Track from "@/models/Track";
import connectDb from "@/libs/connectDb";
import {
  PutObjectCommand,
  S3Client,
  DeleteObjectCommand,
  GetObjectCommand,
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
  const { name, type, metadata, fileName, size } = await req.json();

  try {
    if (!name || !type || !metadata || !fileName || !size) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const user = await Decoded();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDb();

    const { common, format } = metadata;
    const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, "");

    let coverUrl = null;
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

          await s3Client.send(
            new PutObjectCommand({
              Bucket: AWS_BUCKET_NAME,
              Key: `images/track/${name}.${art.format.split("/")[1]}`,
              Body: artBuffer,
              ContentType: art.format,
              CacheControl: "public, max-age=31536000",
              ACL: "private",
            })
          );

          coverUrl = `https://${AWS_BUCKET_NAME}.s3.amazonaws.com/images/track/${name}.${art.format.split("/")[1]}`;
        }
      } catch (error) {
        console.error("Error uploading cover art:", error);
        // Continue without cover art if there's an error
      }
    }

    const track = await Track.create({
      user: user._id,
      name: common.title || nameWithoutExtension,
      artist: common.artist || user.username,
      size: size,
      duration: format.duration || 0,
      s3Key: `${name}.${type.split("/")[1]}`,
      art: coverUrl,
    });

    await User.updateOne({ _id: user._id }, { $push: { tracks: track._id } });

    return NextResponse.json(
      { message: "File uploaded successfully!", trackId: track._id },
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
