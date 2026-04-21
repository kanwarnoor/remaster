import { NextRequest } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "node:stream";

const A_BUCKET_NAME = process.env.A_BUCKET_NAME || "";

const s3Client = new S3Client({
  region: process.env.A_REGION || "",
  credentials: {
    accessKeyId: process.env.A_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.A_SECRET_ACCESS_KEY || "",
  },
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const s3Key = searchParams.get("s3key");

  if (!s3Key) {
    return new Response(JSON.stringify({ error: "No s3key provided" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const range = req.headers.get("range") ?? undefined;
    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: A_BUCKET_NAME,
        Key: `audio/${s3Key}`,
        Range: range,
      }),
    );

    if (!response.Body) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const headers = new Headers();
    headers.set("Content-Type", response.ContentType ?? "audio/mpeg");
    if (response.ContentLength !== undefined)
      headers.set("Content-Length", String(response.ContentLength));
    headers.set("Accept-Ranges", "bytes");
    if (response.ContentRange)
      headers.set("Content-Range", response.ContentRange);
    headers.set("Cache-Control", "private, max-age=3600");

    const nodeStream = response.Body as Readable;
    const webStream = Readable.toWeb(nodeStream) as unknown as ReadableStream;

    return new Response(webStream, {
      status: range ? 206 : 200,
      headers,
    });
  } catch (error) {
    console.error("Error streaming audio:", error);
    return new Response(JSON.stringify({ error: "Failed to stream audio" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
