import { NextResponse } from "next/server";
import connectDb from "@/libs/connectDb";
import prisma from "@/libs/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  if (!q) {
    return NextResponse.json({ error: "No query provided" }, { status: 400 });
  }
  await connectDb();

  try {
    const tracks = await prisma.track.findMany({
      where: {
        OR: [
          {
            name: {
              contains: q,
              mode: "insensitive",
            },
          },
          {
            artist: {
              contains: q,
              mode: "insensitive",
            },
          },
        ],
      },
      take: 5,
    });

    const albums = await prisma.album.findMany({
      where: {
        name: {
          contains: q,
          mode: "insensitive",
        },
      },
      take: 5,
    });
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: q,
          mode: "insensitive",
        },
      },
      take: 5,
    });
    return NextResponse.json({ tracks, albums, users });
  } catch (error) {
    console.error("Error searching tracks:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
