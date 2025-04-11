import { NextRequest, NextResponse } from "next/server";
import {
  S3Client,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME || "";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});


export async function GET(req: NextRequest){
  const {searchParams} = new URL(req.url);
  const s3Key = searchParams.get("s3key");

  if (!s3Key) {
    return NextResponse.json({ error: "No s3key provided" }, { status: 400 });
  }

  try {
    const getObjectCommand = new GetObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: s3Key,
    });
    const url = await getSignedUrl(s3Client, getObjectCommand, {
      expiresIn: 3600,
    });
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return NextResponse.json(
      { error: "Failed to generate signed URL" },
      { status: 500 }
    );
  }

  // get the audio file from s3
 


  // const getObjectCommand = new GetObjectCommand({
    //   Bucket: AWS_BUCKET_NAME,
    //   Key: s3Key,
    // });

    // const url = await getSignedUrl(s3Client, getObjectCommand, {
    //   expiresIn: 3600,
    // });

}