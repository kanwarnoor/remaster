import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { User } from "@/libs/Auth";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function POST(req: NextRequest) {
  try {
    const user = await User();

    if (user == null) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // parse the uploaded file from formData
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // check it the file is audio
    if (!file.type.startsWith("audio/")) {
      return NextResponse.json(
        { error: "File music be audio" },
        { status: 400 }
      );
    }

    // Create a unique key for the file in S3
    const fileExt = file.name.split(".").pop();
    const timestamp = Date.now();
    const fileName = `${user.username}-${file.name}-${fileExt}`;

    // Convert file to buffer for S3 upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload the file to S3
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME || "",
      Key: `audio/${fileName}`,
      Body: buffer,
      ContentType: file.type,
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    // Generate a pre-signed URL for accessing the file (optional)
    const getObjectCommand = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME || "",
      Key: `audio/${fileName}`,
    });
    const url = await getSignedUrl(s3Client, getObjectCommand, {
      expiresIn: 3600, // URL expiration time in seconds;
    });

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",

      file: {
        name: fileName,
        type: file.type,
        size: file.size,
        url: url,
      },
    });
  } catch (error) {
    console.error("Error uploading file: ", error);
    return NextResponse.json({
      error: "failed to upload file!",
      details: error instanceof Error ? error.message : "Unkown error",
      status: 500,
    });
  }
}
