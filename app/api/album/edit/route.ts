import { NextRequest, NextResponse } from "next/server";
import { User as Decoded } from "@/libs/Auth";
import prisma from "@/libs/prisma";
import crypto from "crypto";
import {
  DeleteObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.A_REGION || "",
  credentials: {
    accessKeyId: process.env.A_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.A_SECRET_ACCESS_KEY || "",
  },
});

type PricingFields = { forSale?: boolean; price?: number | null };

function normalizePricing({ forSale, price }: PricingFields) {
  const data: { forSale?: boolean; price?: number | null } = {};
  if (typeof forSale === "boolean") data.forSale = forSale;
  if (price === null) {
    data.price = null;
  } else if (typeof price === "number" && Number.isFinite(price)) {
    const rounded = Math.round(price);
    if (rounded < 0) {
      return { error: "Price cannot be negative" } as const;
    }
    data.price = rounded;
  }
  if (data.forSale === true && (data.price == null || data.price <= 0)) {
    return { error: "Set a positive price before enabling sale" } as const;
  }
  return { data } as const;
}

export async function PATCH(req: NextRequest) {
  try {
    const {
      id,
      name,
      artist,
      fileType,
      fileSize,
      uploaded,
      newKey,
      oldKey,
      forSale,
      price,
    } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing required parameter: id" }, { status: 400 });
    }

    const user = await Decoded();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const album = await prisma.album.findUnique({ where: { id } });
    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    if (album.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized to edit this album" }, { status: 403 });
    }

    const pricing = normalizePricing({ forSale, price });
    if ("error" in pricing) {
      return NextResponse.json({ error: pricing.error }, { status: 400 });
    }

    if (!uploaded) {
      if (fileType && fileSize) {
        const imageKey = crypto.randomBytes(8).toString("hex");
        const command = new PutObjectCommand({
          Bucket: process.env.A_BUCKET_NAME,
          Key: `images/album/${imageKey}`,
          ContentType: fileType,
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        if (!url) {
          return NextResponse.json({ error: "Image URL not generated" }, { status: 500 });
        }

        return NextResponse.json({ url, imageKey }, { status: 200 });
      }

      await prisma.album.update({
        where: { id },
        data: { name, artist, ...pricing.data },
      });
      return NextResponse.json({ message: "Successfully updated" }, { status: 200 });
    } else {
      if (oldKey) {
        try {
          const command = new DeleteObjectCommand({
            Bucket: process.env.A_BUCKET_NAME,
            Key: `images/album/${oldKey}`,
          });
          await s3Client.send(command);
        } catch (s3Error) {
          console.error("Failed to delete old album image from S3:", s3Error);
        }
      }

      await prisma.album.update({
        where: { id },
        data: { name, artist, image: newKey, ...pricing.data },
      });
      return NextResponse.json({ message: "Successfully updated" }, { status: 200 });
    }
  } catch (error) {
    console.error("Error updating album:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
