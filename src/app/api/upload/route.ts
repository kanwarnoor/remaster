import AWS from "aws-sdk";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
import connectDb from "@/libs/connectDb";
import jwt from "jsonwebtoken";

interface DecodedUser {
  id: string;
}

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export async function POST(req: NextRequest) {
  const token = req.headers.get("Authorization");

  // If no token is found, return 401 Unauthorized
  if (!token) {
    return NextResponse.json({ error: "No token found" }, { status: 401 });
  }

  let userId = "";
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || ""
    ) as DecodedUser;
    userId = decoded.id;
  } catch (error) {
    return NextResponse.json({ error: "Token not valid" }, { status: 403 });
  }

  // Connect to the database
  await connectDb();

  // Find the user in the database
  const user = await User.findById(userId);

  // If user is not found, return 404 Not Found
  if (!user) {
    return NextResponse.json(
      { error: "Only a user can upload." },
      { status: 404 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob;

    // If no file is provided, return 400 Bad Request
    if (!file) {
      return NextResponse.json({ error: "No file found" }, { status: 400 });
    }

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME || "",
      Key: `${Date.now()}_${(file as any).name}`,
      Body: file.stream(),
      ContentType: file.type,
    };

    // Try uploading the file to S3
    const data = await s3.upload(params).promise();
    return NextResponse.json({ success: "File uploaded successfully", data });
  } catch (error) {
    // Log the error and return 500 Internal Server Error
    console.error("S3 upload error:", error);
    return NextResponse.json(
      { error: "Error uploading file" },
      { status: 500 }
    );
  }
}
